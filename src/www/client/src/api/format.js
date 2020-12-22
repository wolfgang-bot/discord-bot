import { DISCORD_CDN_BASE_URL } from "../config/constants.js"

export const GUILDS = "GUILDS"

function formatGuild(guild) {
    if (guild.icon) {
        guild.icon_url = `${DISCORD_CDN_BASE_URL}/icons/${guild.id}/${guild.icon}.png`
        guild.icon_url_animated = `${DISCORD_CDN_BASE_URL}/icons/${guild.id}/${guild.icon}`
    }
}

export default function format(type) {
    let fn

    if (type === GUILDS) {
        fn = data => data.data.map(formatGuild)
    }

    return (data) => {
        return new Promise(resolve => {
            fn(data)
            resolve(data)
        })
    }
}