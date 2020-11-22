const config = require("../../../../config")

class ProgressBar {
    constructor(theme, user, progress) {
        this.theme = theme
        this.user = user
        this.progress = progress

        this.height = 16
        this.r = this.height / 2
        this.fill = "#424242"
        this.fillOverlay = "#2980b9"
        this.stroke = "rgba(255, 255, 255, 0.12)"
        this.strokeWidth = 1
    }
    
    getHeight() {
        return this.height
    }

    calculatePath(progress) {
        const { width: maxWidth } = this.theme
        progress = Math.max(0.05, progress) // progress < 5% -> SVG looks odd
        const width = maxWidth * progress
        
        // Error correction
        const start = this.r + 1
        const end = width - this.r - 1

        return `M ${start} 0 L ${end} 0 a 1 1 1 0 1 0 ${this.height} L ${start} ${this.height} a 1 1 0 0 1 0 ${-this.height}`
    }

    toString() {
        return `
            <path d="${this.calculatePath(1)}" fill="${this.fill}" stroke="${this.stroke}" stroke-width="${this.strokeWidth}"/>
            <path d="${this.calculatePath(this.progress)}" fill="${this.fillOverlay}"/>
        `
    }
}

module.exports = ProgressBar