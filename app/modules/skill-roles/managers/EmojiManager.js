const glob = require("glob-promise")
const path = require("path")
const Guild = require("../../../models/Guild.js")

const APP_DIR = path.join(__dirname, "..", "..", "..")
const ICONS_DIR = path.join(APP_DIR, "assets", "icons")

class EmojiManager {
    constructor(guild) {
        this.guild = guild
        this.config = null

        this.emojis = {}
    }

    getEmojis() {
        return this.emojis
    }

    getRoleFromEmoji(emoji) {
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

            let emoji = this.guild.emojis.cache.find(emoji => emoji.name === emojiName)

            if (!emoji) {
                const icon = icons.find(filename => filename.toLowerCase().startsWith(name.toLowerCase()))

                if (!icon) {
                    console.error(`Missing icon for emoji ${name}`)
                    return
                }

                emoji = await this.guild.emojis.create(path.join(ICONS_DIR, icon), emojiName)
            }

            this.emojis[name] = emoji
        }))
    }

    async deleteEmojis() {
        await Promise.all(this.config.roles.map(name => {
            const emojiName = this.makeEmojiName(name)
            const emoji = this.guild.emojis.cache.find(emoji => emoji.name === emojiName)

            if (emoji) {
                return emoji.delete()
            }
        }))
    }

    makeEmojiName(name) {
        return this.config.emojiPrefix + name.toLowerCase()
    }

    async init() {
        this.config = (await Guild.config(this.guild))["skill-roles"]
        
        await this.createEmojis()
    }

    async delete() {
        await this.deleteEmojis()
    }
}

module.exports = EmojiManager