import SVGComponent from "../../../../lib/SVGComponent"
import Member from "../../../../models/Member"
import { Theme } from "../ProfileCard"
import { getLevel } from "../../../../utils"
import ReputationSystemConfig from "../../models/Configuration"

export default class Rank extends SVGComponent {
    config: ReputationSystemConfig
    theme: Theme
    fontSize: number = 16
    rankName: string

    constructor(config: ReputationSystemConfig, theme: Theme, member: Member) {
        super()
        this.config = config
        this.theme = theme

        const level = getLevel(this.config, member.reputation)
        this.rankName = config.roles[level] || ""
    }
    
    getWidth() {
        return this.rankName.length * this.fontSize
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
