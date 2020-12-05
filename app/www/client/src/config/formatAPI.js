export const USER = "USER"

function formatUser(user) {
    user.avatar_url = "https://cdn.discordapp.com/avatars/" + user.id + "/" + user.avatar
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