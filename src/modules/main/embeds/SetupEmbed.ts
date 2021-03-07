import { MessageEmbed } from "discord.js"

export default class SetupEmbed extends MessageEmbed {
    constructor(state: 0 | 1) {
        super()

        this.setTitle("Setup")
            .setDescription(
                state === 0 ?
                "Will be ready in a few seconds. Turn up! 🔥⚡" :
                "Ready to go 🚀🚀🚀"
            )
    }
}
