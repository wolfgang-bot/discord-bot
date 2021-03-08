import Discord from "discord.js"
import WebSocketController from "../../../lib/WebSocketController"
import { success, error } from "../responses"
import Guild from "../../../models/Guild"
import { AuthorizedSocket } from "../SocketManager"
import {
    ValidationPipeline,
    GuildExistsValidator,
    GuildAvailableValidator,
    GuildAdminValidator
} from "../../../lib/Validation"

export default class GuildController extends WebSocketController {
    validationPipeline: ValidationPipeline

    constructor(client: Discord.Client, socket: AuthorizedSocket) {
        super(client, socket)

        this.validationPipeline = new ValidationPipeline(client, [
            new GuildExistsValidator(error(404)),
            new GuildAvailableValidator(error(404)),
            new GuildAdminValidator(error(403))
        ])

        const makeArgs = (guildId: string) => ({
            guildId,
            user: this.socket.user
        })

        this.getChannels = this.validationPipeline.bind(this.getChannels.bind(this), makeArgs)
        this.getRoles = this.validationPipeline.bind(this.getRoles.bind(this), makeArgs)
        this.getMemberCount = this.validationPipeline.bind(this.getMemberCount.bind(this), makeArgs)
    }

    /**
     * Get guilds from the authorized user
     */
    async getGuilds(send: Function) {
        const guilds = Object.values(this.socket.guilds)

        guilds.sort((a, b) => (b.isActive as unknown as number) - (a.isActive as unknown as number))

        send(success(guilds))
    }

    /**
     * Get the channels (text, voice, category, ...) of a guild
     */
    async getChannels(validationError: object | void, guildId: string, send: Function) {
        if (validationError) {
            send(validationError)
            return
        }

        const guild = await Guild.findBy("id", guildId) as Guild
        await guild.fetchDiscordGuild(this.client)

        send(success(guild.discordGuild.channels.cache))
    }

    /**
     * Get the roles of a guild
     */
    async getRoles(validationError: object | void, guildId: string, send: Function) {
        if (validationError) {
            send(validationError)
            return
        }

        const guild = await Guild.findBy("id", guildId) as Guild
        await guild.fetchDiscordGuild(this.client)

        const roles = await guild.discordGuild.roles.fetch()

        send(success(roles.cache))
    }

    /**
     * Get member count of guild
     */
    async getMemberCount(validationError: object | void, guildId: string, send: Function) {
        if (validationError) {
            send(validationError)
            return
        }
        
        const guild = await this.client.guilds.fetch(guildId)
        send(success(guild.memberCount))
    }
}
