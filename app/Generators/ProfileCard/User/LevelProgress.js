const ProgressBar = require("./ProgressBar.js")
const Rank = require("./Rank.js")
const Reputation = require("./Reputation.js")
const config = require("../../../../config")
const { getLevel } = require("../../../utils")

class LevelProgress {
    constructor(theme, user, width) {
        this.theme = theme
        this.user = user
        this.width = width

        const level = getLevel(this.user.reputation)
        const nextLevel = Math.min(level + 1, config.reputationSystem.roles.length - 1)
        const lastReputation = config.reputationSystem.roleThresholds[level] || 0
        const progress = (this.user.reputation - lastReputation) / (config.reputationSystem.roleThresholds[nextLevel] - lastReputation)

        this.progressBar = new ProgressBar(this.theme, this.user, this.width, progress)
        this.rank = new Rank(this.theme, this.user)
        this.reputation = new Reputation(this.theme, this.user)
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