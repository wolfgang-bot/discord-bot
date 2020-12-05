import { DISCORD_CDN_BASE_URL, DEFAULT_AVATAR_URL } from "./constants.js"

export const USER = "USER"

function formatUser(user) {
    if (user.avatar)  {
        user.avatar_url = `${DISCORD_CDN_BASE_URL}/avatars/${user.id}/${user.avatar}.png`
        user.avatar_url_animated = `${DISCORD_CDN_BASE_URL}/avatars/${user.id}/${user.avatar}`
    } else {
        user.avatar_url = user.avatar_url_animated = DEFAULT_AVATAR_URL.replace(/{}/g, user.discriminator % 5)
    }
}

export default function format(type) {
    let fn

    if (type === USER) {
        fn = data => formatUser(data.data)
    }

    return (data) => {
        return new Promise(resolve => {
            fn(data)
            resolve(data)
        })
    }
}