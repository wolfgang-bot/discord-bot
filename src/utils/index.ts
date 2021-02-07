import Discord from "discord.js"
import User from "../models/User"

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
        .replace(process.env.DISCORD_BOT_PREFIX, "")
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
export function getLevel(config, reputation: number) {
    let level = -1

    for (let threshold of config["reputation-system"].roleThresholds as number[]) {
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
 * Check recursively if a key exists in an object
 */
export function existsInObject(object: object, key: string) {
    for (let _key in object) {
        if (_key === key) {
            return true
        }

        if (object[_key].constructor.name === "Object" && existsInObject(object[_key], key)) {
            return true
        }
    }

    return false
}

/**
 * Convert a string to the requested data-type
 * Supported data-types: String, Number, Array
 */
export function convertDatatype(input: string, datatype: "String" | "Number" | "Array") {
    if (datatype === "String") {
        return input
    }

    if (datatype === "Number") {
        const number = parseFloat(input)

        if (isNaN(number)) {
            throw "Not a number"
        }

        return number
    }

    if (datatype === "Array") {
        return input.split(" ")
    }

    throw new Error(`Unsupported datatype: "${datatype}"`)
}

/**
 * Check recursively if two objects have the same keys and every value has
 * the same type.
 */
export function compareStructure(object1: object, object2: Object) {
    // Collect keys from both objects
    const keys = new Set(Object.keys(object1).concat(Object.keys(object2)))

    for (let key of keys) {
        // Verify existance
        if (!(key in object1) || !(key in object2)) {
            return false
        }

        // Verify data-type
        if (object1[key].constructor.name !== object2[key].constructor.name) {
            return false
        }

        // Verify array element's datatype
        if (object1[key].constructor.name === "Array") {
            for (let value of object1[key]) {
                if (value.constructor.name !== object2[key][0].constructor.name) {
                    return false
                }
            }
        }

        // Verify recursively if the sub-objects have the same structure
        if (object1[key].constructor.name === "Object" && !compareStructure(object1[key], object2[key])) {
            return false
        }
    }

    return true
}

/**
 * Create a URL from a path with respect to the env variables
 */
export function makeURL(path: string) {
    return `${process.env.PROTOCOL}://${process.env.HOST}${process.env.PUBLIC_PORT ? ":" + process.env.PUBLIC_PORT : ""}${path}`
}

/**
 * Recursively transfer the values from one object to another object.
 * 
 * Example:
 *
 * from = {
 *     a: "abc",
 *     b: {
 *     },
 *     d: 789
 * }
 *
 *
 * to = {
 *     a: "xyz", // Set to "abc"
 *     b: {
 *         c: 456 // Do nothing
 *     }
 * }
 */
export function transferValues(from: object, to: object): object {
    const result = {}

    function _transfer(from: object = {}, to: object, result: object) {
        Object.keys(to).forEach(key => {
            if (to[key].constructor.name === "Object") {
                result[key] = {}
                _transfer(from[key], to[key], result[key])
            } else {
                result[key] = typeof from[key] !== "undefined" ? from[key] : to[key]
            }
        })
    }

    _transfer(from, to, result)

    return result
}

/**
 * Check if a guild member has all permissions
 */
export async function checkPermissions(guild: Discord.Guild, user: User | Discord.User, permissions: Discord.PermissionString[]) {
    const member = await guild.members.fetch(user.id)
    return member.hasPermission(permissions)
}