class Username {
    constructor(theme, user) {
        this.theme = theme
        this.user = user
        this.fontSize = 22
    }

    toString() {
        return `
            <text font-size="${this.fontSize}" y="${this.fontSize}">
<tspan fill="${this.theme.palette.primary}">${this.user.discordUser.username}</tspan>
<tspan fill="${this.theme.palette.disabled}">#${this.user.discordUser.discriminator}</tspan>
            </text>
        `
    }
}

module.exports = Username