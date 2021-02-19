import Discord from "discord.js"

import CommandGroup from "../lib/CommandGroup"
import Guild from "../models/Guild"

type GuildCommandGroupsMap = Record<string, CommandGroup>

class CommandRegistry {
    static guildCommandsMap: GuildCommandGroupsMap = {}
    root: CommandGroup

    /**
     * Get the root command group for a guild
     */
    static guild(guild: Discord.Guild | Guild) {
        return this.guildCommandsMap[guild.id]
    }

    /**
     * Register the root command group for a guild
     */
    static registerGroupForGuild(guild: Discord.Guild | Guild, commandGroup: CommandGroup) {
        this.guildCommandsMap[guild.id] = commandGroup
    }

    /**
     * Unregister a guild
     */
    static unregisterGuild(guild: Discord.Guild | Guild) {
        delete this.guildCommandsMap[guild.id]
    }
}

export default CommandRegistry