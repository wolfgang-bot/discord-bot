import Discord from "discord.js"
import WebSocketController from "../../../lib/WebSocketController"
import { success, error } from "../responses"
import Guild from "../../../models/Guild"
import OAuthServiceProvider from "../../services/OAuthServiceProvider"
import { AuthorizedSocket } from "../SocketManager"
import {
    ValidationPipeline,
    GuildExistsValidator,
    GuildAvailableValidator,
    GuildAdminValidator,
    ValidationError
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
        const guilds = await OAuthServiceProvider.fetchGuilds(this.socket.user.access_token)

        // Filter guilds where the user is an admin
        const adminGuilds = guilds.filter(guild => {
            return new Discord.Permissions(guild.permissions as string as Discord.PermissionResolvable)
                .has("ADMINISTRATOR")
        })

        // Check for each guild if it's registered
        await Promise.all(adminGuilds.map(async guild => {
            const model = await Guild.findBy("id", guild.id)
            guild.isActive = !!model
        }))

        // Sort active guilds to the top
        adminGuilds.sort((a, b) => (b.isActive as unknown as number) - (a.isActive as unknown as number))

        send(success(adminGuilds))
    }

    /**
     * Get the channels (text, voice, category, ...) of a guild
     */
    async getChannels(validationError: ValidationError, guildId: string, send: Function) {
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
    async getRoles(validationError: ValidationError, guildId: string, send: Function) {
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
    async getMemberCount(validationError: ValidationError, guildId: string, send: Function) {
        if (validationError) {
            send(validationError)
            return
        }
        
        const guild = await this.client.guilds.fetch(guildId)
        send(success(guild.memberCount))
    }
}
