import SVGComponent from "../../../../lib/SVGComponent"
import Member from "../../../../models/Member"
import { Theme } from "../ProfileCard"
import { getLevel } from "../../../../utils"
import ProgressBar from "./ProgressBar"
import Rank from "./Rank"
import Reputation from "./Reputation"
import ReputationSystemConfig from "../../models/Configuration"

export default class LevelProgress extends SVGComponent {
    config: ReputationSystemConfig
    theme: Theme
    member: Member
    width: number

    constructor(config: ReputationSystemConfig, theme: Theme, member: Member, width: number) {
        super()
        this.config = config
        this.theme = theme
        this.member = member
        this.width = width

        const level = getLevel(this.config, this.member.reputation)
        const nextLevel = Math.min(level + 1, this.config.roles.length - 1)
        const lastReputation = this.config.roleThresholds[level] || 0
        const progress = (this.member.reputation - lastReputation) / (this.config.roleThresholds[nextLevel] - lastReputation)

        this.children.progressBar = new ProgressBar(this.config, this.theme, this.member, this.width, progress)
        this.children.rank = new Rank(this.config, this.theme, this.member)
        this.children.reputation = new Reputation(this.config, this.theme, this.member)
    }

    getWidth() {
        return Math.max(
            this.children.rank.getWidth(),
            this.children.reputation.getWidth(),
            this.children.progressBar.getWidth()
        )
    }

    getHeight() {
        return this.children.reputation.getHeight() + this.children.progressBar.getHeight() + this.theme.spacing * .8
    }

    toString() {
        return `
            ${this.children.rank}

            <g transform="translate(${this.width} ${this.children.rank.getHeight() - this.children.reputation.getHeight()})">
                ${this.children.reputation}
            </g>

            <g transform="translate(0 ${this.children.rank.getHeight() + this.theme.spacing / 2})">
                ${this.children.progressBar}
            </g>
        `
    }
}
