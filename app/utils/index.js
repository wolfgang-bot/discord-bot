const BLANK = "\u200B"

function makeCodeblock(str) {
    return "```\n" + str + "```"
}

function parseCommand(content) {
    const args = content
        .replace(process.env.DISCORD_BOT_PREFIX, "")
        .replace(/\s+/g, " ")
        .split(" ")

    const command = args.shift()

    return [command, args]
}

function getLevel(config, reputation) {
    let level = -1

    for (let threshold of config.reputationSystem.roleThresholds) {
        if (reputation >= threshold) {
            level++
        } else {
            return level
        }
    }

    return level
}

function space(length) {
    return (BLANK + " ").repeat(length)
}

function formatDescriptiveObject(object) {
    const parsed = {}

    for (let key in object) {
        if (typeof object[key].value === "object" && !Array.isArray(object[key].value)) {
            parsed[key] = formatDescriptiveObject(object[key].value)
        } else {
            parsed[key] = object[key].value
        }
    }

    return parsed
}

function insertIntoDescriptiveObject(source, dest) {
    const result = {}

    for (let key in source) {
        result[key] = dest[key]
        result[key].value = source[key]
    }

    return result
}

module.exports = { makeCodeblock, parseCommand, getLevel, space, formatDescriptiveObject, insertIntoDescriptiveObject }