import log from "loglevel"
import Manager from "../../../lib/Manager"
import ModuleInstance from "../../../models/ModuleInstance"
import ActiveSchedule, { ActiveScheduleJSON } from "../models/ActiveSchedule"

enum SCHEDULE_TYPES {
    UNBAN = 0
}

type InstanceData = {
    schedules?: Record<SCHEDULE_TYPES, ActiveScheduleJSON[]>
}

class SchedulesManager extends Manager {
    timeouts: NodeJS.Timeout[] = []

    async scheduleUnban(userId: string, timestamp: number) {
        const schedule = new ActiveSchedule(userId, timestamp)
        schedule.type = SCHEDULE_TYPES.UNBAN
        this.scheduleFunction(this.handleUnban.bind(this, userId), schedule)
        await this.storeSchedule(schedule)
    }

    scheduleFunction(fn: Function, schedule: ActiveSchedule) {
        const wrapper = async () => {
            fn()
            await this.deleteSchedule(schedule)
        }
        const timeout = setTimeout(wrapper, schedule.timestamp - Date.now())
        this.timeouts.push(timeout)
    }

    async handleUnban(userId: string) {
        try {
            const user = await this.context.client.users.fetch(userId)
            await this.context.guild.members.unban(user)
        } catch (error) {
            log.error(error)
        }
    }

    async storeSchedule(schedule: ActiveSchedule) {
        const instance = await ModuleInstance.findByContext(this.context)
        if (!instance.data.schedules) {
            instance.data.schedules = []
        }
        if (!instance.data.schedules[schedule.type]) {
            instance.data.schedules[schedule.type] = []
        }
        instance.data.schedules[schedule.type].push(schedule)
        await instance.update()
    }

    async deleteSchedule(schedule: ActiveSchedule) {
        const model = await ModuleInstance.findByContext(this.context)
        const schedules = (model.data as InstanceData).schedules?.[schedule.type as SCHEDULE_TYPES]
        const index = schedules.findIndex(_schedule => (
            _schedule[0] === schedule.userId &&
            _schedule[1] === schedule.timestamp
        ))
        schedules.splice(index, 1)
        await model.update()
    }
    
    async restoreSchedules(schedules: ActiveSchedule[]) {
        for (let schedule of schedules) {
            if (schedule.type === SCHEDULE_TYPES.UNBAN) {
                this.scheduleFunction(
                    this.handleUnban.bind(this, schedule.userId),
                    schedule
                )
            }
        }
    }

    async loadSchedules() {
        const { data }: { data: InstanceData } = await ModuleInstance.findByContext(this.context)
        if (!data?.schedules) {
            return []
        }
        return Object.entries(data.schedules)
            .map(([type, schedules]) => (
                schedules.map((json) => {
                    const activeSchedule = ActiveSchedule.fromJSON(json)
                    activeSchedule.type = parseInt(type)
                    return activeSchedule
                })
            ))
            .flat()
    }

    async init() {
        const schedules = await this.loadSchedules()
        await this.restoreSchedules(schedules)
    }

    async delete() {
        this.timeouts.forEach(clearTimeout)
    }
}

export default SchedulesManager
