import SVGComponent from "../../../../lib/SVGComponent"
import Member from "../../../../models/Member"
import { Theme } from "../ProfileCard"

export default class Username extends SVGComponent {
    theme: Theme
    member: Member
    fontSize: number = 22
    
    constructor(config, theme: Theme, member: Member) {
        super()
        this.theme = theme
        this.member = member
    }

    getWidth() {
        return (this.member.discordUser.username.length + this.member.discordUser.discriminator.length) * this.fontSize
    }

    getHeight() {
        return this.fontSize * 2
    }

    toString() {
        return `
            <text font-size="${this.fontSize}" y="${this.fontSize}">
<tspan fill="${this.theme.palette.primary}">${this.member.discordUser.username}</tspan>
<tspan fill="${this.theme.palette.disabled}">#${this.member.discordUser.discriminator}</tspan>
            </text>
        `
    }
}