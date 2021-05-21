import { ActiveScheduleJSON } from "./ActiveSchedule"

export enum SCHEDULE_TYPES {
    UNBAN = 0
}

export type InstanceData = {
    schedules?: Record<SCHEDULE_TYPES, ActiveScheduleJSON[]>
    muteRoleId?: string
}
