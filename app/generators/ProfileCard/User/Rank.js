const { getLevel } = require("../../../utils")

class Rank {
    constructor(config, theme, user) {
        this.config = config
        this.theme = theme

        this.fontSize = 16

        const level = getLevel(this.config, user.reputation)
        this.rankName = config["reputation-system"].roles[level] || ""
    }
    
    getHeight() {
        return this.fontSize
    }

    toString() {
        return `
            <text
                font-size="${this.fontSize}"
                y="${this.fontSize}"
                fill="${this.theme.palette.primary}"
            >${this.rankName}</text>
        `
    }
}

module.exports = Rank