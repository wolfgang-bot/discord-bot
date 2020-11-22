class Level {
    constructor(theme, user, level) {
        this.theme = theme
        this.user = user
        this.level = level + 1

        this.fontSize = 14
    }

    toString() {
        return `
            <text
                text-anchor="middle"
                font-size="${this.fontSize}"
                fill="${this.theme.palette.primaryVariant}"
                y="${this.fontSize / 4}"
            >${this.level}</text>
        `
    }
}

module.exports = Level