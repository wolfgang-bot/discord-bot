const Avatar = require("./Avatar.js")
const Username = require("./Username.js")
const LevelProgress = require("./LevelProgress.js")

class User {
    constructor(config, theme, user, avatarURI) {
        this.config = config
        this.theme = theme
        this.user = user
        this.avatarURI = avatarURI
        
        this.avatar = new Avatar(this.config, this.theme, this.avatarURI)
        const levelProgressWidth = this.theme.width - this.avatar.size - this.theme.spacing
        this.levelProgress = new LevelProgress(this.config, this.theme, this.user, levelProgressWidth)
    }

    getHeight() {
        return this.avatar.getHeight()
    }

    toString() {
        return `
            ${this.avatar}

            <g transform="translate(${this.avatar.size + this.theme.spacing})">
                ${new Username(this.config, this.theme, this.user)}

                <g transform="translate(0 ${this.avatar.size - this.levelProgress.getHeight()})">
                    ${this.levelProgress}
                </g>
            </g>
        `
    }
}

module.exports = User