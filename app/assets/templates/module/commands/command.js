const Command = require("../../../lib/Command.js")

async function run(message, args) {
    await message.channel.send("Hello World!")
}

module.exports = new Command(run)
    .setName("command")
    .setGroup("General")
    .setDescription("Sends back 'Hello World!'")
    .setAlias(["cmd"])