import * as Discord from "discord.js"
import glob from "glob-promise"
import path from "path"
import Manager from "../../../lib/Manager"
import Guild from "../../../models/Guild"
import Configuration from "../models/Configuration"

const ICONS_DIR = path.join(__dirname, "..", "assets", "icons")

type EmojiMap = {
    [roleName: string]: Discord.GuildEmoji
}

export default class EmojiManager extends Manager {
    config: Configuration
    emojis: EmojiMap = {}

    getEmojis() {
        return this.emojis
    }

    getRoleFromEmoji(emoji: Discord.Emoji) {
        for (let [roleName, { id }] of Object.entries(this.emojis)) {
            if (id === emoji.id) {
                return roleName
            }
        }
    }

    async createEmojis() {
        const icons = await glob("*.png", { cwd: ICONS_DIR })

        await Promise.all(this.config.roles.map(async name => {
            const emojiName = this.makeEmojiName(name)

            let emoji = this.context.guild.emojis.cache.find(emoji => emoji.name === emojiName)

            if (!emoji) {
                const icon = icons.find(filename => filename.toLowerCase().startsWith(name.toLowerCase()))

                if (!icon) {
                    console.error(`Missing icon for emoji ${name}`)
                    return
                }

                emoji = await this.context.guild.emojis.create(path.join(ICONS_DIR, icon), emojiName)
            }

            this.emojis[name] = emoji
        }))
    }

    async deleteEmojis() {
        await Promise.all(this.config.roles.map(name => {
            const emojiName = this.makeEmojiName(name)
            const emoji = this.context.guild.emojis.cache.find(emoji => emoji.name === emojiName)

            if (emoji) {
                return emoji.delete()
            }
        }))
    }

    makeEmojiName(name: string) {
        return this.config.emojiPrefix + name.toLowerCase()
    }

    async init() {
        this.config = (await Guild.config(this.context.guild))["skill-roles"]
        
        await this.createEmojis()
    }

    async delete() {
        await this.deleteEmojis()
    }
}