import { Guild } from "@personal-discord-bot/shared/dist/models"
import defaultConfigRaw from "../config/default"

let defaultConfig: object

function initGuildModel() {
    Guild.setGetDefaultConfig(() => {
        if (!defaultConfig) {
            defaultConfig = defaultConfigRaw.toVanillaObject()
        }

        return defaultConfig
    })
}

function initModels() {
    initGuildModel()
}

export default initModels
