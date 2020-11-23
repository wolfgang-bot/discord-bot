const config = require("../../../../config")
const { getLevel } = require("../../../utils")

class Reputation {
    constructor(theme, user) {
        this.theme = theme
        this.user = user

        const level = getLevel(user.reputation)
        const nextLevel = Math.min(level + 1, config.reputationSystem.roleThresholds.length - 1)
        this.nextLevelReputation = config.reputationSystem.roleThresholds[nextLevel]
        
        this.fontSize = 12
        this.opacity = .5
    }

    getHeight() {
        return this.fontSize
    }

    toString() {
        return `
            <text
                text-anchor="end"
                fill="${this.theme.palette.primaryVariant}"
                opacity="${this.opacity}"
                font-size="${this.fontSize}"
                y="${this.fontSize}"
            >
                ${this.user.reputation}/${this.nextLevelReputation}
            </text>
        `
    }
}

module.exports = Reputation