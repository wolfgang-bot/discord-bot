import SVGComponent from "../../../../lib/SVGComponent"
import Member from "../../../../models/Member"
import { Theme } from "../ProfileCard"
import { getLevel } from "../../../../utils"
import ReputationSystemConfig from "../../models/Configuration"

export default class Reputation extends SVGComponent {
    config
    theme: Theme
    member: Member
    nextLevelReputation: number
    fontSize: number = 12
    opacity: number = .5

    constructor(config: ReputationSystemConfig, theme: Theme, member: Member) {
        super()
        this.config = config
        this.theme = theme
        this.member = member

        const level = getLevel(this.config, member.reputation)
        const nextLevel = Math.min(level + 1, this.config.roleThresholds.length - 1)
        this.nextLevelReputation = this.config.roleThresholds[nextLevel]
    }

    getWidth() {
        return `${this.member.reputation}/${this.nextLevelReputation}`.length * this.fontSize
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
                ${this.member.reputation}/${this.nextLevelReputation}
            </text>
        `
    }
}
