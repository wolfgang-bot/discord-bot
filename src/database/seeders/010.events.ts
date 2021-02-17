import Event, { EVENT_TYPES } from "../../models/Event"
import { Seeder, ProgressCallback } from "../index"

const GENERATE_DATA_FOR_DAYS = 14
const GUILD_ID = "786167187030540309"
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

const INITIAL_MEMBER_COUNT = 1000
const MIN_AMOUNT_OF_MEMBER_EVENTS = 100
const MAX_AMOUNT_OF_MEMBER_EVENTS = 200
const MEMBER_JOIN_LEAVE_RATIO = .8

const MIN_AMOUNT_OF_MESSAGES = 100
const MAX_AMOUNT_OF_MESSAGES = 300

function random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min)
}

function createRandomTimestampNDaysAgo(days: number) {
    return Date.now() - days * MILLISECONDS_PER_DAY + random(0, 1e4)
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
    const amountsOfEntries = Array(GENERATE_DATA_FOR_DAYS)
        .fill(0)
        .map(() => (
            shouldGenerateData() ?
            random(MIN_AMOUNT_OF_MEMBER_EVENTS, MAX_AMOUNT_OF_MEMBER_EVENTS) :
            0
        ))

    const totalAmountOfEntries = sum(amountsOfEntries)

    callback({
        type: "init",
        key: "Members",
        data: totalAmountOfEntries
    })

    let memberCount = INITIAL_MEMBER_COUNT
    
    for (let i = amountsOfEntries.length - 1; i >= 0; i--) {
        const randomFactor = Math.random() > .8 ? -1 : 1
        
        for (let j = 0; j < amountsOfEntries[i]; j++) {
            const type = Math.random() >= MEMBER_JOIN_LEAVE_RATIO * randomFactor ?
                EVENT_TYPES.GUILD_MEMBER_REMOVE :
                EVENT_TYPES.GUILD_MEMBER_ADD

            const newMemberCount = type === EVENT_TYPES.GUILD_MEMBER_REMOVE ?
                memberCount-- :
                memberCount++

            await new Event({
                type,
                timestamp: createRandomTimestampNDaysAgo(i),
                guild_id: GUILD_ID,
                meta: {
                    memberCount: newMemberCount
                }
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
                timestamp: createRandomTimestampNDaysAgo(i),
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