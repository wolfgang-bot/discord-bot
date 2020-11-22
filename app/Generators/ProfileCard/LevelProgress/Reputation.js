const config = require("../../../../config")
const { getLevel } = require("../../../utils")

class Reputation {
    constructor(theme, user) {
        this.theme = theme
        this.user = user

        this.fontSize = 16

        const level = getLevel(user.reputation)
        const nextLevel = Math.min(level + 1, config.reputationSystem.roleThresholds.length - 1)
        this.nextLevelReputation = config.reputationSystem.roleThresholds[nextLevel]
    }

    getHeight() {
        return this.fontSize
    }

    toString() {
        return `
            <text
                fill="${this.theme.palette.primaryVariant}"
                font-size="${this.fontSize}"
                y="${this.fontSize}"
            >
                Reputation: ${this.user.reputation} von ${this.nextLevelReputation}
            </text>
        `
    }
}

module.exports = Reputation