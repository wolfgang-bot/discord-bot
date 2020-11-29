const { capitalCase } = require("change-case")
const Guild = require("../../models/Guild.js")

/**
 * Extract all keys and their depth recursively out of an object
 * 
 * @param {Object} object 
 * @param {int} depth 
 * @returns {Array<{ key: String, depth: int }>} All keys and their depth
 */
function getKeysRecursive(object, depth = 0) {
    const keys = []

    for (let key in object) {
        keys.push({ key, depth })

        if (object[key].constructor.name === "Object") {
            keys.push(...getKeysRecursive(object[key], depth + 1))
        }
    }

    return keys
}

class ConfigController {
    /**
     * Discord bot client instance
     */
    static client = null

    static setDiscordClient(client) {
        ConfigController.client = client
    }

    /**
     * Render the "config" view with the config of the requested guild
     */
    static async get(req, res) {
        const guild = await Guild.findBy("id", req.params.guildId)
        
        if (!guild) {
            return res.render("404")
        }

        await guild.fetchDiscordGuild(ConfigController.client)

        const keys = getKeysRecursive(guild.config)
        
        res.render("config", {
            guild,
            keys,

            helpers: {
                capitalCase,
                getMargin: n => n * 2,
                getFont: n => n === 0 ? "font-bold" : ""
            }
        })
    }
}

module.exports = ConfigController