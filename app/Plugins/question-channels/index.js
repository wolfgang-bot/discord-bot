const Plugin = require("../../lib/Plugin.js")

class QuestionChannelsPlugin extends Plugin {
    client = null

    async init(args, message) {
        this.client = message.client

        this.client.on("message", this.handleMessage)
    }

    async handleMessage(message) {
        console.log(message.content)
    }
}

module.exports = QuestionChannelsPlugin