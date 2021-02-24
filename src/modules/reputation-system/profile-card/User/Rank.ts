import { SVGComponent } from "@personal-discord-bot/shared/dist"
import { Member } from "@personal-discord-bot/shared/dist/models"
import { Theme } from "../ProfileCard"
import { getLevel } from "@personal-discord-bot/shared/dist/utils"

export default class Rank extends SVGComponent {
    config
    theme: Theme
    fontSize: number = 16
    rankName: string

    constructor(config, theme: Theme, member: Member) {
        super()
        this.config = config
        this.theme = theme

        const level = getLevel(this.config, member.reputation)
        this.rankName = config["reputation-system"].roles[level] || ""
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
