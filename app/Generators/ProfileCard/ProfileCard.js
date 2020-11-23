const Background = require("./Background.js")
const User = require("./User/User.js") 
const LevelProgress = require("./LevelProgress/LevelProgress.js")
const config = require("../../../config")
const { getLevel } = require("../../utils")

class ProfileCard {
    constructor(user, avatarURI) {
        this.user = user
        this.avatarURI = avatarURI

        this.level = getLevel(this.user.reputation)
        
        this.width = 400

        this.theme = {
            spacing: 16,
            backgroundColor: "#202225",
            palette: {
                primaryVariant: "#f8f9fa",
                secondary: "rgba(255, 255, 255, .7)",
                disabled: "rgba(255, 255, 255, .5)"
            }
        }

        this.theme.palette.primary = this.level !== -1 ? config.reputationSystem.roleColors[this.level] : this.theme.palette.secondary

        this.theme.width = this.width - this.theme.spacing * 2
    }

    toString() {
        const user = new User(this.theme, this.user, this.avatarURI)
        const levelProgress = new LevelProgress(this.theme, this.user)

        const svg = `
            <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                version="1.1"
                width="${this.width}" 
                height="{height}" 
                font-family="Roboto, sans-serif"
            >
                ${new Background(this.theme)}

                <g transform="translate(${this.theme.spacing} ${this.theme.spacing})">
                    ${user}

                    <g transform="translate(0 ${user.getHeight() + this.theme.spacing})">
                        ${levelProgress}
                    </g>
                </g>
            </svg>
        `

        const height = this.theme.spacing * 3 + user.getHeight() + levelProgress.getHeight()

        return svg.replace(/{height}/g, height)
    }
}

module.exports = ProfileCard