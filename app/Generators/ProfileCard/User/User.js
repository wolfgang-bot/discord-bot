const Avatar = require("./Avatar.js")
const Username = require("./Username.js")
const LevelProgress = require("./LevelProgress.js")

class User {
    constructor(theme, user, avatarURI) {
        this.theme = theme
        this.user = user
        this.avatarURI = avatarURI

        this.avatar = new Avatar(this.theme, this.avatarURI)
        this.levelProgress = new LevelProgress(this.theme, this.user, this.theme.width - this.avatar.size - this.theme.spacing)
    }

    getHeight() {
        return this.avatar.getHeight()
    }

    toString() {
        return `
            ${this.avatar}

            <g transform="translate(${this.avatar.size + this.theme.spacing})">
                ${new Username(this.theme, this.user)}

                <g transform="translate(0 ${this.avatar.size - this.levelProgress.getHeight()})">
                    ${this.levelProgress}
                </g>
            </g>
        `
    }
}

module.exports = User