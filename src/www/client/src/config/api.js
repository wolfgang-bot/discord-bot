import axios from "axios"

import format, {
    USER,
    GUILD,
    GUILDS
} from "./formatAPI.js"
import { API_BASE_URL } from "./constants.js"

export function setTokenHeader(token) {
    axios.defaults.headers.common = {
        "Authorization": "Baerer " + token
    }
}

function url(path) {
    return API_BASE_URL + path
}

export const getProfile = () => axios.get(url("/oauth/discord/profile")).then(format(USER))
export const getGuild = (id) => axios.get(url("/oauth/discord/guild/" + id)).then(format(GUILD))
export const getGuilds = () => axios.get(url("/oauth/discord/guilds")).then(format(GUILDS))

export const getConfig = (id) => axios.get(url("/config/" + id))
export const getConfigDescriptive = (id) => axios.get(url("/config/descriptive/" + id))
export const setConfig = (id, data) => axios.post(url("/config/" + id), data)

export const getModules = () => axios.get(url("/modules"))
export const getModuleInstances = (guildId) => axios.get(url("/modules/instances/" + guildId))
export const startModuleInstance = (guildId, moduleName, body) => axios.post(url("/modules/instances/" + guildId + "/start/" + moduleName), { body })
export const stopModuleInstance = (guildId, moduleName) => axios.post(url("/modules/instances/" + guildId + "/stop/" + moduleName))
export const restartModuleInstance = (guildId, moduleName) => axios.post(url("/modules/instances/" + guildId + "/restart/" + moduleName))