import * as Discord from "discord.js"

export default abstract class HttpController {
    static client: Discord.Client

    static setDiscordClient(client: Discord.Client) {
        this.client = client
    }
}