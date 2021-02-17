import Event, { EVENT_TYPES } from "../../models/Event"
import { Seeder, ProgressCallback } from "../index"

const GENERATE_DATA_FOR_DAYS = 30
const GUILD_ID = "786167187030540309"

const SKIP_DAY_PROBABILITY = .1

const INITIAL_MEMBER_COUNT = 1000
const MIN_AMOUNT_OF_MEMBER_EVENTS_PER_DAY = 100
const MAX_AMOUNT_OF_MEMBER_EVENTS_PER_DAY = 300
const MEMBER_JOIN_LEAVE_RATIO = .7
const MEMBER_DROP_PROBABILITY = .1

const MIN_AMOUNT_OF_MESSAGES_PER_DAY = 100
const MAX_AMOUNT_OF_MESSAGES_PER_DAY = 300

const RANDOM_TIMESTAMPS_SPREAD_IN_MILLISECONDS = 1e4

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

function random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min)
}

function createRandomTimestampNDaysAgo(days: number) {
    const randomOffset = random(0, RANDOM_TIMESTAMPS_SPREAD_IN_MILLISECONDS)
    return Date.now() - days * MILLISECONDS_PER_DAY + randomOffset
}

function shouldGenerateData() {
    return Math.random() > SKIP_DAY_PROBABILITY
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
            shouldGenerateData() ? random(
                MIN_AMOUNT_OF_MEMBER_EVENTS_PER_DAY,
                MAX_AMOUNT_OF_MEMBER_EVENTS_PER_DAY
            ) : 0
        ))

    const totalAmountOfEntries = sum(amountsOfEntries)

    callback({
        type: "init",
        key: "Members",
        data: totalAmountOfEntries
    })

    let memberCount = INITIAL_MEMBER_COUNT
    
    for (let i = amountsOfEntries.length - 1; i >= 0; i--) {
        const randomFactor = Math.random() < MEMBER_DROP_PROBABILITY ? -1 : 1
        
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
            shouldGenerateData() ? random(
                MIN_AMOUNT_OF_MESSAGES_PER_DAY,
                MAX_AMOUNT_OF_MESSAGES_PER_DAY
            ) : 0
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