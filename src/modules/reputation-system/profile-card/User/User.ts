import SVGComponent from "@personal-discord-bot/shared/dist/SVGComponent"
import Member from "@personal-discord-bot/shared/dist/models/Member"
import { Theme } from "../ProfileCard"
import Avatar from "./Avatar"
import Username from "./Username"
import LevelProgress from "./LevelProgress"

export default class User extends SVGComponent {
    config
    theme: Theme
    member: Member
    avatarURI: string

    constructor(config, theme: Theme, member: Member, avatarURI: string) {
        super()
        this.config = config
        this.theme = theme
        this.member = member
        this.avatarURI = avatarURI
        
        this.children.avatar = new Avatar(this.config, this.theme, this.avatarURI)
        const levelProgressWidth = this.theme.width - (this.children.avatar as Avatar).size - this.theme.spacing
        this.children.levelProgress = new LevelProgress(this.config, this.theme, this.member, levelProgressWidth)
        this.children.username = new Username(this.config, this.theme, this.member)
    }

    getWidth() {
        return this.children.levelProgress.getWidth()
    }

    getHeight() {
        return this.children.avatar.getHeight()
    }

    toString() {
        const avatar = this.children.avatar as Avatar

        return `
            ${this.children.avatar}

            <g transform="translate(${avatar.size + this.theme.spacing})">
                ${this.children.username}

                <g transform="translate(0 ${avatar.size - this.children.levelProgress.getHeight()})">
                    ${this.children.levelProgress}
                </g>
            </g>
        `
    }
}
