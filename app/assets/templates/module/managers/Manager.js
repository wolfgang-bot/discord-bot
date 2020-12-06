const Guild = require("../../../models/Guild.js")

class Manager {
    constructor(client, guild) {
        this.client = client
        this.guild = guild

        this.config = null
    }

    async init() {
        this.config = await Guild.config(this.guild)["{MODULE_NAME}"]
    }

    async delete() {

    }
}

module.exports = Manager