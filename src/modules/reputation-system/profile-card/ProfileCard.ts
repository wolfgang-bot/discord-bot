import SVGComponent from "../../../lib/SVGComponent"
import Member from "../../../models/Member"
import Background from "./Background"
import User from "./User/User"
import { getLevel } from "../../../utils"

export type Theme = {
    spacing: number
    backgroundColor: string
    width: number
    palette: {
        primaryVariant: string
        primary: string
        secondary: string
        disabled: string
    }
}

export default class ProfileCard extends SVGComponent {
    config: any
    member: Member
    avatarURI: string
    level: number
    width: number
    theme: Theme

    constructor(config, member: Member, avatarURI: string) {
        super()

        this.config = config
        this.member = member
        this.avatarURI = avatarURI

        this.level = getLevel(this.config, this.member.reputation)
        
        this.width = 400

        this.theme = {
            spacing: 16,
            backgroundColor: "#202225",
            width: null,
            palette: {
                primaryVariant: "#f8f9fa",
                secondary: "rgba(255, 255, 255, .7)",
                disabled: "rgba(255, 255, 255, .5)",
                primary: null
            }
        }

        this.theme.palette.primary = this.level !== -1 ? this.config["reputation-system"].roleColors[this.level] : this.theme.palette.secondary
        
        this.theme.width = this.width - this.theme.spacing * 2
    }

    getWidth() {
        return this.theme.width
    }

    getHeight() {
        return this.theme.spacing + this.children.user.getHeight()
    }

    toString() {
        this.children.user = new User(this.config, this.theme, this.member, this.avatarURI)
        this.children.background = new Background(this.config, this.theme)

        const svg = `
            <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                version="1.1"
                width="${this.width}" 
                height="{height}" 
                font-family="Roboto, sans-serif"
            >
                ${this.children.background}

                <g transform="translate(${this.theme.spacing} ${this.theme.spacing})">
                    ${this.children.user}
                </g>
            </svg>
        `

        const height = this.theme.spacing * 2 + this.children.user.getHeight()

        return svg.replace(/{height}/g, height.toString())
    }
}