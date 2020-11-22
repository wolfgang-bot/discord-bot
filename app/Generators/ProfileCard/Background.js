class Background {
    constructor(theme) {
        this.theme = theme
    }

    toString() {
        return `<rect width="100%" height="100%" fill="${this.theme.backgroundColor}"/>`
    }
}

module.exports = Background