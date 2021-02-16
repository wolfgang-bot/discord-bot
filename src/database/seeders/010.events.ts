import Event, { EVENT_TYPES } from "../../models/Event"
import { Seeder } from "../index"

const GENERATE_DATA_FOR_DAYS = 90
const GUILD_ID = "786167187030540309"

function createTimestampNDaysAgo(days: number) {
    const msPerDay = 24 * 60 * 60 * 1000
    return Date.now() - days * msPerDay
}

function random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min)
}

function shouldGenerateData() {
    return Math.random() > .2
}

function sum(numbers: number[]) {
    return numbers.reduce((sum, current) => sum + current, 0)
}

const seeder: Seeder = {
    table: "events",

    run: async (callback: (event: any) => void) => {
        const amountsOfEntries = Array(GENERATE_DATA_FOR_DAYS)
            .fill(0)
            .map(() => shouldGenerateData() ? random(100, 300) : 0)

        const totalAmountOfEntries = sum(amountsOfEntries)
        let currentEntry = 0

        callback({
            type: "init",
            data: totalAmountOfEntries
        })

        for (let i = 0; i < amountsOfEntries.length; i++) {
            for (let j = 0; j < amountsOfEntries[i]; j++) {
                await new Event({
                    type: EVENT_TYPES.MESSAGE_SEND,
                    timestamp: createTimestampNDaysAgo(i),
                    guild_id: GUILD_ID
                }).store()

                callback({
                    type: "update",
                    data: ++currentEntry
                })
            }
        }
        
        callback({
            type: "stop"
        })
    }
}

export default seeder