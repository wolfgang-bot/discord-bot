type ActiveScheduleProps = {
    type: number
    userId: string
    timestamp: number
}

export type ActiveScheduleJSON = [string, number]

export default class ActiveSchedule implements ActiveScheduleProps {
    type: number
    userId: string
    timestamp: number

    static fromJSON(json: ActiveScheduleJSON) {
        return new ActiveSchedule(...json)
    }

    constructor(userId: string, timestamp: number) {
        this.userId = userId
        this.timestamp = timestamp
    }

    toJSON() {
        return [this.userId, this.timestamp]
    }
}
