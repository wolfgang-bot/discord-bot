import { DISCORD_CDN_BASE_URL, DEFAULT_AVATAR_URL } from "./constants.js"

export const USER = "USER"
export const GUILD = "GUILD"
export const GUILDS = "GUILDS"

function formatUser(user) {
    if (user.avatar)  {
        user.avatar_url = `${DISCORD_CDN_BASE_URL}/avatars/${user.id}/${user.avatar}.png`
        user.avatar_url_animated = `${DISCORD_CDN_BASE_URL}/avatars/${user.id}/${user.avatar}`
    } else {
        user.avatar_url = user.avatar_url_animated = DEFAULT_AVATAR_URL.replace(/{}/g, user.discriminator % 5)
    }
}

function formatGuild(guild) {
    if (guild.icon) {
        guild.icon_url = `${DISCORD_CDN_BASE_URL}/icons/${guild.id}/${guild.icon}.png`
        guild.icon_url_animated = `${DISCORD_CDN_BASE_URL}/icons/${guild.id}/${guild.icon}`
    }
}

export default function format(type) {
    let fn

    if (type === USER) {
        fn = data => formatUser(data.data)
    } else if (type === GUILD) {
        fn = data => formatGuild(data.data)
    } else if (type === GUILDS) {
        fn = data => data.data.map(formatGuild)
    }

    return (data) => {
        return new Promise(resolve => {
            fn(data)
            resolve(data)
        })
    }
}