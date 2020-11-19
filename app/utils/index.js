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

module.exports = { makeCodeblock, parseCommand }