import { Manager } from "@personal-discord-bot/shared/dist/module"
import { Guild } from "@personal-discord-bot/shared/dist/models"

export default class MyManager extends Manager {
    async init() {
        this.config = await Guild.config(this.context.guild)["{MODULE_KEY}"]
    }

    async delete() {

    }
}
