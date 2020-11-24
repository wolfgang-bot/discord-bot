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

module.exports = { makeCodeblock, parseCommand, getLevel, space }