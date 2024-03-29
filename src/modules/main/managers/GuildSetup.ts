import Discord from "discord.js"
import { EventEmitter } from "events"
import Guild, { GUILD_STATUS } from "../../../models/Guild"
import Member from "../../../models/Member"
import User from "../../../models/User"
import CommandRegistry from "../../../services/CommandRegistry"
import ModuleInstanceRegistry from "../../../services/ModuleInstanceRegistry"
import RootCommandGroup from "../commands"
import SetupEmbed from "../embeds/SetupEmbed"
import BroadcastChannel from "../../../services/BroadcastChannel"

export default class GuildSetup extends EventEmitter {
    constructor(
        private client: Discord.Client,
        public guild: Discord.Guild
    ) {
        super()
    }

    async run() {
        const channel = await this.getFirstTextChannel(this.client, this.guild)

        if (channel) {
            await this.withLoadingIndicator(channel, this.setupGuild.bind(this))
        } else {
            await this.setupGuild()
        }
    }

    async setupGuild() {
        const guildModel = await this.storeGuild(this.guild)

        CommandRegistry.registerGroupForGuild(this.guild, new RootCommandGroup())
        await ModuleInstanceRegistry.guild(this.guild).startStaticModuleInstances(this.client)

        await this.guild.members.fetch()

        await Promise.all(this.guild.members.cache.map(this.storeMember.bind(this)))

        guildModel.status = GUILD_STATUS.ACTIVE
        await this.updateGuild(guildModel)
    }

    async storeGuild(guild: Discord.Guild) {
        const model = new Guild({ id: guild.id }) as Guild
        await model.store()
        BroadcastChannel.emit("guild/create", model)
        return model
    }

    async updateGuild(model: Guild) {
        await model.update()
        BroadcastChannel.emit("guild/update", model)
    }

    async storeMember(member: Discord.GuildMember) {
        if (member.user.bot) {
            return
        }

        let user = await User.findBy("id", member.user.id) as User

        if (!user) {
            user = new User({ id: member.user.id })
            await user.store()
            this.emit("user/create", user)
        }

        const model = new Member({
            user_id: user.id,
            guild_id: this.guild.id
        })
        await model.store()
    }

    isTextChannel(channel: Discord.GuildChannel): channel is Discord.TextChannel {
        return channel.type === "text"
    }

    async getFirstTextChannel(client: Discord.Client, guild: Discord.Guild) {
        guild.channels.cache.sort((a, b) => a.position - b.position)

        for (let [_, channel] of guild.channels.cache) {
            if (!this.isTextChannel(channel)) {
                continue
            }

            const permissions = channel.permissionsFor(client.user)
            if (!permissions.has("SEND_MESSAGES")) {
                continue
            }

            return channel
        }
    }

    async withLoadingIndicator(
        channel: Discord.TextChannel,
        callback: () => Promise<void>
    ) {
        const message = await channel.send(new SetupEmbed(0))
        await callback()
        await message.edit(new SetupEmbed(1))
    }
}
