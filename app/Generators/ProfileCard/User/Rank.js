const config = require("../../../../config")
const { getLevel } = require("../../../utils")

class Rank {
    constructor(theme, user) {
        this.theme = theme

        this.fontSize = 16

        const level = getLevel(user.reputation)
        this.rankName = config.reputationSystem.roles[level] || ""
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