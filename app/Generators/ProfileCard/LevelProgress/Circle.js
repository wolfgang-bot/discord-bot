const Level = require("./Level.js")

class Circle {
    constructor(theme, user, level) {
        this.theme = theme
        this.user = user
        this.level = level

        this.size = 42
        this.r = this.size / 2
        this.fill = "#424242"
        this.stroke = "rgba(255, 255, 255, 0.12)"
        this.strokeWidth = 1
    }

    getHeight() {
        return this.size
    }

    getWidth() {
        return this.size
    }
    
    toString() {
        return `
            <circle
                r="${this.r}"
                cx="${this.r}"
                cy="${this.r}"
                fill="${this.fill}"
                stroke="${this.stroke}"
                stroke-width="${this.strokeWidth}"
            />

            <g transform="translate(${this.r} ${this.r})">
                ${new Level(this.theme, this.user, this.level)}
            </g>
        `
    }
}

module.exports = Circle