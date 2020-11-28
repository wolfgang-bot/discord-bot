const { getLevel } = require("../../../utils")

class Reputation {
    constructor(config, theme, user) {
        this.config = config
        this.theme = theme
        this.user = user

        const moduleConfig = config["reputation-system"]

        const level = getLevel(this.config, user.reputation)
        const nextLevel = Math.min(level + 1, moduleConfig.roleThresholds.length - 1)
        this.nextLevelReputation = moduleConfig.roleThresholds[nextLevel]
        
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