import Discord from "discord.js"
import Collection from "@personal-discord-bot/shared/dist/orm/Collection"
import { Guild } from "@personal-discord-bot/shared/dist/models"
import { Module } from "@personal-discord-bot/shared/dist/module"
import { Context } from "@personal-discord-bot/shared/dist/module"
import { module, global } from "@personal-discord-bot/shared/dist/module/decorators"
import CommandRegistry from "../../services/CommandRegistry"
import EventManager from "./managers/EventManager"
import RootCommandGroup from "./commands"

@module({
    key: "main",
    name: "Main"
})
@global
class MainModule extends Module {
    static commands = Object.values(
        new RootCommandGroup().getSubCommands()
    )
    
    client: Discord.Client
    eventManager: EventManager

    constructor(context: Context) {
        super(context)
        this.eventManager = new EventManager(this.context)
    }

    async start() {
        this.eventManager.init()
        await this.registerCommandsForGuilds()
    }

    async registerCommandsForGuilds() {
        const guilds = await Guild.getAll() as Collection<Guild>

        await guilds.mapAsync(guild => {
            CommandRegistry.registerGroupForGuild(guild, new RootCommandGroup())
        })
    }
}

export default MainModule
