const Avatar = require("./Avatar.js")
const Username = require("./Username.js")
const Rank = require("./Rank.js")

class User {
    constructor(theme, user, avatarURI) {
        this.theme = theme
        this.user = user
        this.avatarURI = avatarURI

        this.avatar = new Avatar(this.theme, this.avatarURI)
        this.rank = new Rank(this.theme, this.user)
    }

    getHeight() {
        return this.avatar.getHeight()
    }

    toString() {
        return `
            ${this.avatar}

            <g transform="translate(${this.avatar.size + this.theme.spacing})">
                ${new Username(this.theme, this.user)}

                <g transform="translate(0 ${this.avatar.getHeight() - this.rank.getHeight() * 1.5})">
                    ${this.rank}
                </g>
            </g>
        `
    }
}

module.exports = User