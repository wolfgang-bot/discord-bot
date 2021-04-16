import Event, { EVENT_TYPES, GuildEventMeta, GuildMemberEventMeta, UserEventMeta, VoiceChannelLeaveEventMeta } from "../../models/Event"
import { Seeder, ProgressCallback } from "../index"

const GENERATE_DATA_FOR_DAYS = 7
const GUILD_ID = "786167187030540309"
const USER_IDS = ["778665386497015838", "224908212212596736"]

const SKIP_DAY_PROBABILITY = 0
const RANDOM_TIMESTAMPS_SPREAD_IN_MILLISECONDS = 1e4

const MILLISECONDS_PER_MINUTE = 60 * 1000
const MILLISECONDS_PER_HOUR = MILLISECONDS_PER_MINUTE * 60
const MILLISECONDS_PER_DAY = MILLISECONDS_PER_HOUR * 24

// Guilds
const MIN_AMOUNT_OF_GUILDS_PER_DAY = 10
const MAX_AMOUNT_OF_GUILDS_PER_DAY = 50
const GUILD_ADD_REMOVE_RATIO = .8
const GUILD_DROP_PROBABILITY = .1

// Members
const INITIAL_MEMBER_COUNT = 1000
const MIN_AMOUNT_OF_MEMBERS_PER_DAY = 100
const MAX_AMOUNT_OF_MEMBERS_PER_DAY = 300
const MEMBER_JOIN_LEAVE_RATIO = .7
const MEMBER_DROP_PROBABILITY = .1

// Users
const MIN_INITIAL_USERS = MIN_AMOUNT_OF_MEMBERS_PER_DAY * .3
const MAX_INITIAL_USERS = MAX_AMOUNT_OF_MEMBERS_PER_DAY * .7

// Messages
const MIN_AMOUNT_OF_MESSAGES_PER_DAY = 100
const MAX_AMOUNT_OF_MESSAGES_PER_DAY = 300

// Voicechat
const MIN_AMOUNT_OF_VOICECHAT_EVENTS_PER_DAY = 1
const MAX_AMOUNT_OF_VOICECHAT_EVENTS_PER_DAY = 10
const MIN_VOICECHAT_DURATION_PER_EVENT = MILLISECONDS_PER_MINUTE * 1
const MAX_VOICECHAT_DURATION_PER_EVENT = MILLISECONDS_PER_HOUR * 2

function random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min)
}

function getRandomUserId() {
    return USER_IDS[random(0, USER_IDS.length)]
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

function makeDualEventsSeeder<TMeta = undefined>({
    key,
    types,
    amountOfEntriesMinMax,
    dropProbability = 0,
    typesRatio = 1,
    initialCount = 0,
    guildId = GUILD_ID,
    withUserId,
    makeMetaValue
}: {
    key: string,
    types: [EVENT_TYPES, EVENT_TYPES] | EVENT_TYPES,
    amountOfEntriesMinMax: [number, number],
    dropProbability?: number,
    typesRatio?: number,
    initialCount?: number,
    guildId?: string,
    withUserId?: boolean,
    makeMetaValue?: ({ count: number }) => TMeta
}) {
    if (!Array.isArray(types)) {
        types = [types, types]
    }

    return async (callback: ProgressCallback) => {
        const amountsOfEntries = randomAmountOfEntries(...amountOfEntriesMinMax)

        const totalAmountOfEntries = sum(amountsOfEntries)

        callback({
            type: "init",
            key,
            data: totalAmountOfEntries
        })

        let count = initialCount

        for (let i = amountsOfEntries.length - 1; i >= 0; i--) {
            const randomFactor = Math.random() < dropProbability ? -1 : 1

            for (let j = 0; j < amountsOfEntries[i]; j++) {
                const type = Math.random() <= typesRatio * randomFactor ?
                    types[0] :
                    types[1]

                if (type === types[0]) {
                    count++
                } else {
                    count--
                }

                if (count < 0) {
                    count = 0
                    callback({ type: "tick", key })
                    continue
                }

                await new Event({
                    type,
                    timestamp: createRandomTimestampNDaysAgo(i),
                    guild_id: guildId,
                    user_id: withUserId ? getRandomUserId() : undefined,
                    meta: makeMetaValue?.({ count })
                }).store()

                callback({ type: "tick", key })
            }
        }
    }
}

const generateMessageEvents = makeDualEventsSeeder({
    key: "Messages",
    types: EVENT_TYPES.MESSAGE_SEND,
    amountOfEntriesMinMax: [
        MIN_AMOUNT_OF_MESSAGES_PER_DAY,
        MAX_AMOUNT_OF_MESSAGES_PER_DAY
    ],
    withUserId: true
})

const generateGuildEvents = makeDualEventsSeeder<GuildEventMeta>({
    key: "Guilds",
    types: [EVENT_TYPES.GUILD_ADD, EVENT_TYPES.GUILD_REMOVE],
    amountOfEntriesMinMax: [
        MIN_AMOUNT_OF_GUILDS_PER_DAY,
        MAX_AMOUNT_OF_GUILDS_PER_DAY
    ],
    dropProbability: GUILD_DROP_PROBABILITY,
    typesRatio: GUILD_ADD_REMOVE_RATIO,
    guildId: "123",
    makeMetaValue: ({ count }) => ({ guildCount: count })
})

const generateUserEvents = makeDualEventsSeeder<UserEventMeta>({
    key: "Users",
    types: EVENT_TYPES.USER_ADD,
    amountOfEntriesMinMax: [
        MIN_INITIAL_USERS,
        MAX_INITIAL_USERS
    ],
    makeMetaValue: ({ count }) => ({ userCount: count }),
    withUserId: true
})

const generateMemberEvents = makeDualEventsSeeder<GuildMemberEventMeta>({
    key: "Members",
    types: [EVENT_TYPES.GUILD_MEMBER_ADD, EVENT_TYPES.GUILD_MEMBER_REMOVE],
    amountOfEntriesMinMax: [
        MIN_AMOUNT_OF_MEMBERS_PER_DAY,
        MAX_AMOUNT_OF_MEMBERS_PER_DAY
    ],
    initialCount: INITIAL_MEMBER_COUNT,
    dropProbability: MEMBER_DROP_PROBABILITY,
    typesRatio: MEMBER_JOIN_LEAVE_RATIO,
    makeMetaValue: ({ count }) => ({ memberCount: count }),
    withUserId: true
})

const generateVoiceEvents = makeDualEventsSeeder<VoiceChannelLeaveEventMeta>({
    key: "Voice",
    types: EVENT_TYPES.VOICECHANNEL_LEAVE,
    amountOfEntriesMinMax: [
        MIN_AMOUNT_OF_VOICECHAT_EVENTS_PER_DAY,
        MAX_AMOUNT_OF_VOICECHAT_EVENTS_PER_DAY
    ],
    makeMetaValue: () => ({
        duration: random(
            MIN_VOICECHAT_DURATION_PER_EVENT,
            MAX_VOICECHAT_DURATION_PER_EVENT
        )
    }),
    withUserId: true
})

const eventGenerators = [
    generateGuildEvents,
    generateUserEvents,
    generateMemberEvents,
    generateMessageEvents,
    generateVoiceEvents
]

const seeder: Seeder = {
    table: "events",

    run: async (callback: ProgressCallback) => {
        await Promise.all(eventGenerators.map(
            generator => generator(callback)
        ))
    }
}

export default seeder
