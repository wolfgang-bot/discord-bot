import Event, { EVENT_TYPES } from "../../models/Event"
import { Seeder, ProgressCallback } from "../index"

const GENERATE_DATA_FOR_DAYS = 7
const GUILD_ID = "786167187030540309"

const SKIP_DAY_PROBABILITY = .1

const MILLISECONDS_PER_MINUTE = 60 * 1000
const MILLISECONDS_PER_HOUR = MILLISECONDS_PER_MINUTE * 60
const MILLISECONDS_PER_DAY = MILLISECONDS_PER_HOUR * 24

const MIN_AMOUNT_OF_GUILDS_PER_DAY = 10
const MAX_AMOUNT_OF_GUILDS_PER_DAY = 50
const GUILD_ADD_REMOVE_RATIO = .8
const GUILD_DROP_PROBABILITY = .1

const INITIAL_MEMBER_COUNT = 1000
const MIN_AMOUNT_OF_MEMBER_EVENTS_PER_DAY = 100
const MAX_AMOUNT_OF_MEMBER_EVENTS_PER_DAY = 300
const MEMBER_JOIN_LEAVE_RATIO = .7
const MEMBER_DROP_PROBABILITY = .1

const MIN_AMOUNT_OF_MESSAGES_PER_DAY = 100
const MAX_AMOUNT_OF_MESSAGES_PER_DAY = 300

const MIN_AMOUNT_OF_VOICECHAT_EVENTS_PER_DAY = 1
const MAX_AMOUNT_OF_VOICECHAT_EVENTS_PER_DAY = 10
const MIN_VOICECHAT_DURATION_PER_EVENT = MILLISECONDS_PER_MINUTE * 1
const MAX_VOICECHAT_DURATION_PER_EVENT = MILLISECONDS_PER_HOUR * 2

const RANDOM_TIMESTAMPS_SPREAD_IN_MILLISECONDS = 1e4

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

function randomAmountOfEntries(min: number, max: number) {
    return Array(GENERATE_DATA_FOR_DAYS)
        .fill(0)
        .map(() => shouldGenerateData() ? random(min, max) : 0)
}

function sum(numbers: number[]) {
    return numbers.reduce((sum, current) => sum + current, 0)
}

/**
 * Generate guild add / remove events
 */
async function generateGuildEvents(callback: ProgressCallback) {
    const amountsOfEntries = randomAmountOfEntries(
        MIN_AMOUNT_OF_GUILDS_PER_DAY,
        MAX_AMOUNT_OF_GUILDS_PER_DAY
    )

    const totalAmountOfEntries = sum(amountsOfEntries)

    callback({
        type: "init",
        key: "Guilds",
        data: totalAmountOfEntries
    })

    let guildCount = 0

    for (let i = amountsOfEntries.length - 1; i >= 0; i--) {
        const randomFactor = Math.random() < GUILD_DROP_PROBABILITY ? -1 : 1

        for (let j = 0; j < amountsOfEntries[i]; j++) {
            const type = Math.random() >= GUILD_ADD_REMOVE_RATIO * randomFactor ?
                EVENT_TYPES.GUILD_ADD :
                EVENT_TYPES.GUILD_REMOVE

            const newGuildCount = type === EVENT_TYPES.GUILD_ADD ?
                guildCount-- :
                guildCount++

            if (newGuildCount < 0) {
                guildCount = 0
                callback({
                    type: "tick",
                    key: "Guilds"
                })
                continue
            }

            await new Event({
                type,
                timestamp: createRandomTimestampNDaysAgo(i),
                guild_id: "123",
                meta: {
                    guildCount: newGuildCount
                }
            }).store()

            callback({
                type: "tick",
                key: "Guilds"
            })
        }
    }
}

/**
 * Generate guild member add / remove events
 */
async function generateMemberEvents(callback: ProgressCallback) {
    const amountsOfEntries = randomAmountOfEntries(
        MIN_AMOUNT_OF_MEMBER_EVENTS_PER_DAY,
        MAX_AMOUNT_OF_MEMBER_EVENTS_PER_DAY
    )

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

            if (newMemberCount < 0) {
                memberCount = 0
                callback({
                    type: "tick",
                    key: "Guilds"
                })
                continue
            }

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
    const amountsOfEntries = randomAmountOfEntries(
        MIN_AMOUNT_OF_MESSAGES_PER_DAY,
        MAX_AMOUNT_OF_MESSAGES_PER_DAY
    )
            
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

/**
 * Generate voice duration events
 */
async function generateVoiceEvents(callback: ProgressCallback) {
    const amountsOfEntries = randomAmountOfEntries(
        MIN_AMOUNT_OF_VOICECHAT_EVENTS_PER_DAY,
        MAX_AMOUNT_OF_VOICECHAT_EVENTS_PER_DAY
    )

    const totalAmountOfEntries = sum(amountsOfEntries)

    callback({
        type: "init",
        key: "Voice",
        data: totalAmountOfEntries
    })

    for (let i = 0; i < amountsOfEntries.length; i++) {
        for (let j = 0; j < amountsOfEntries[i]; j++) {
            const duration = random(
                MIN_VOICECHAT_DURATION_PER_EVENT,
                MAX_VOICECHAT_DURATION_PER_EVENT
            )

            await new Event({
                type: EVENT_TYPES.VOICECHANNEL_LEAVE,
                timestamp: createRandomTimestampNDaysAgo(i),
                guild_id: GUILD_ID,
                meta: {
                    duration
                }
            }).store()

            callback({
                type: "tick",
                key: "Voice"
            })
        }
    }
}

const seeder: Seeder = {
    table: "events",

    run: async (callback: ProgressCallback) => {
        await Promise.all([
            generateGuildEvents(callback),
            generateMemberEvents(callback),
            generateMessageEvents(callback),
            generateVoiceEvents(callback)
        ])
    }
}

export default seeder
