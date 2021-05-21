import Discord from "discord.js"
import path from "path"
import fs from "fs"
import User from "../models/User"
import ReputationSystemConfig from "../modules/reputation-system/models/Configuration"

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Blank character which is not the "whitespace" character (used in discord embeds to make indents)
const BLANK = "\u200B"

/**
 * Make a Markdown Codeblock
 */
export function makeCodeblock(str: string) {
    return "```\n" + str + "```"
}

/**
 * Parse an argument string into an array and accept quoted string to
 * contain whitespace. It works like a PDA.
 * 
 * Example:
 * 'arg1 "arg 2" arg3' --> ["arg1", "arg 2", "arg3"]
 */
export function parseArguments(content: string) {
    // Sanitize input
    content = content
        .trim()
        .replace(/\s+/g, " ")

    const args: string[] = []

    let currentArg = ""
    let stack: string[] = []

    for (let char of content) {
        let top = stack.pop()

        if (top === '"') { // Input is quoted
            if (char === '"') { // Quotes are closed
                args.push(currentArg)
                currentArg = ""
            } else {
                currentArg += char
                stack.push(top)
            }
        } else {
            if (currentArg.length === 0 && char === '"') { // Quote starts at beginning of argument
                stack.push(char)
            } else if (char === " ") {
                if (currentArg.length > 0) {
                    args.push(currentArg)
                    currentArg = ""
                }
            } else {
                currentArg += char
            }
        }
    }

    if (currentArg.length > 0) {
        args.push(currentArg)
    }

    return args
}

/**
 * Get the corresponding level to an amount of reputation
 */
export function getLevel(config: ReputationSystemConfig, reputation: number) {
    let level = -1

    for (let threshold of config.roleThresholds as number[]) {
        if (reputation >= threshold) {
            level++
        } else {
            return level
        }
    }

    return level
}

/**
 * Generates an empty string which has a given length (used for markdown)
 */
export function space(length: number) {
    return (BLANK + " ").repeat(length)
}

/**
 * Create a URL from a path with respect to the env variables
 */
export function makeURL(path: string) {
    return `${process.env.PROTOCOL}://${process.env.HOST}${process.env.PUBLIC_PORT ? ":" + process.env.PUBLIC_PORT : ""}${path}`
}

/**
 * Check if a guild member has all permissions
 */
export async function checkPermissions(guild: Discord.Guild, user: User | Discord.User, permissions: Discord.PermissionString[]) {
    const member = await guild.members.fetch(user.id)
    return member.hasPermission(permissions)
}

/**
 * Filter with async support
 */
export async function filterAsync<T>(array: T[], filterFn: (value: T) => Promise<boolean>) {
    const filter = await Promise.all(array.map(filterFn))
    return array.filter((_, i) => filter[i])
}

/**
 * Surround string with backticks
 */
export function applyBackticks(input: string) {
    return `\`${input}\``
}

/**
 * Like Array.prototype.map, but with support for async function
 */
export function mapAsync<T, U>(
    array: Array<T>,
    callback: (item: T, index: number) => Promise<U>
) {
    return Promise.all(array.map(callback))
}

/**
 * Pick a random element from an array
 */
export function pickRandomFromArray<T>(array: T[]) {
    return array[Math.floor(Math.random() * array.length)]
}

/**
 * Get the user-id from a mention
 * Example:
 * <@!123456> --> 123456
 */
export function getUserIdFromMention(mention: string) {
    return mention.match(/\d+/)?.[0]
}
