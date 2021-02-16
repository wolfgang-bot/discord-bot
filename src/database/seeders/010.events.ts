import Event, { EVENT_TYPES } from "../../models/Event"
import { Seeder, ProgressCallback } from "../index"

const GENERATE_DATA_FOR_DAYS = 1
const GUILD_ID = "786167187030540309"

const MIN_AMOUNT_OF_MEMBERS_JOINED = 80
const MAX_AMOUNT_OF_MEMBERS_JOINED = 100
const MIN_AMOUNT_OF_MEMBERS_LEFT = 60
const MAX_AMOUNT_OF_MEMBERS_LEFT = 90

const MIN_AMOUNT_OF_MESSAGES = 100
const MAX_AMOUNT_OF_MESSAGES = 100

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

/**
 * Generate guild member add / remove events
 */
async function generateMemberEvents(callback: ProgressCallback) {
    const data = Array(GENERATE_DATA_FOR_DAYS)
        .fill(0)
        .map(() => [
            random(MIN_AMOUNT_OF_MEMBERS_JOINED, MAX_AMOUNT_OF_MEMBERS_JOINED),
            random(MIN_AMOUNT_OF_MEMBERS_LEFT, MAX_AMOUNT_OF_MEMBERS_LEFT)
        ])

    const totalAmountOfEntries = sum(data.flat())

    callback({
        type: "init",
        key: "Members",
        data: totalAmountOfEntries
    })
    
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i][0]; j++) {
            await new Event({
                type: EVENT_TYPES.GUILD_MEMBER_ADD,
                timestamp: createTimestampNDaysAgo(i),
                guild_id: GUILD_ID
            }).store()

            callback({
                type: "tick",
                key: "Members"
            })
        }
        
        for (let j = 0; j < data[i][1]; j++) {
            await new Event({
                type: EVENT_TYPES.GUILD_MEMBER_REMOVE,
                timestamp: createTimestampNDaysAgo(i),
                guild_id: GUILD_ID
            }).store()

            callback({
                type: "tick",
                key: "Members"
            })
        }
    }
}

/**
 * Generate message send events
 */
async function generateMessageEvents(callback: ProgressCallback) {
    const amountsOfEntries = Array(GENERATE_DATA_FOR_DAYS)
        .fill(0)
        .map(() => (
            shouldGenerateData() ?
            random(MIN_AMOUNT_OF_MESSAGES, MAX_AMOUNT_OF_MESSAGES) :
            0
        ))

    const totalAmountOfEntries = sum(amountsOfEntries)

    callback({
        type: "init",
        key: "Message",
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
                type: "tick",
                key: "Message"
            })
        }
    }
}

const seeder: Seeder = {
    table: "events",

    run: async (callback: ProgressCallback) => {
        await Promise.all([
            generateMemberEvents(callback),
            generateMessageEvents(callback)
        ])
    }
}

export default seeder