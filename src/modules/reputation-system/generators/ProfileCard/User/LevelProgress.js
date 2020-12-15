const ProgressBar = require("./ProgressBar.js")
const Rank = require("./Rank.js")
const Reputation = require("./Reputation.js")
const { getLevel } = require("../../../../../utils")

class LevelProgress {
    constructor(config, theme, user, width) {
        this.config = config
        this.theme = theme
        this.user = user
        this.width = width

        const moduleConfig = this.config["reputation-system"]

        const level = getLevel(this.config, this.user.reputation)
        const nextLevel = Math.min(level + 1, moduleConfig.roles.length - 1)
        const lastReputation = moduleConfig.roleThresholds[level] || 0
        const progress = (this.user.reputation - lastReputation) / (moduleConfig.roleThresholds[nextLevel] - lastReputation)

        this.progressBar = new ProgressBar(this.config, this.theme, this.user, this.width, progress)
        this.rank = new Rank(this.config, this.theme, this.user)
        this.reputation = new Reputation(this.config, this.theme, this.user)
    }

    getHeight() {
        return this.reputation.getHeight() + this.progressBar.getHeight() + this.theme.spacing * .8
    }

    toString() {
        return `
            ${this.rank}

            <g transform="translate(${this.width} ${this.rank.getHeight() - this.reputation.getHeight()})">
                ${this.reputation}
            </g>

            <g transform="translate(0 ${this.rank.getHeight() + this.theme.spacing / 2})">
                ${this.progressBar}
            </g>
        `
    }
}

module.exports = LevelProgress