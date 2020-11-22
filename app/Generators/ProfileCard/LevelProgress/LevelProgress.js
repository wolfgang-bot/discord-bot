const Reputation = require("./Reputation.js")
const Circle = require("./Circle.js")
const ProgressBar = require("./ProgressBar.js")
const config = require("../../../../config")
const { getLevel } = require("../../../utils")

class LevelProgress {
    constructor(theme, user) {
        this.theme = theme
        this.user = user

        const level = getLevel(this.user.reputation)
        const nextLevel = Math.min(level + 1, config.reputationSystem.roles.length - 1)
        const lastReputation = config.reputationSystem.roleThresholds[level] || 0
        const progress = (this.user.reputation - lastReputation) / (config.reputationSystem.roleThresholds[nextLevel] - lastReputation)

        this.reputation = new Reputation(this.theme, this.user)
        this.leftCircle = new Circle(this.theme, this.user, level)
        this.rightCircle = new Circle(this.theme, this.user, nextLevel)
        this.progressBar = new ProgressBar(this.theme, this.user, progress)
    }

    getHeight() {
        return this.reputation.getHeight() + this.theme.spacing + this.leftCircle.getHeight()
    }

    toString() {
        return `
            ${this.reputation}

            <g transform="translate(0 ${this.reputation.getHeight() + this.theme.spacing})">
                <g transform="translate(0 ${this.leftCircle.getHeight() / 2 - this.progressBar.getHeight() / 2})">
                    ${this.progressBar}
                </g>

                ${this.leftCircle}

                <g transform="translate(${this.theme.width - this.rightCircle.getWidth()})">
                    ${this.rightCircle}
                </g>
            </g>
        `
    }
}

module.exports = LevelProgress