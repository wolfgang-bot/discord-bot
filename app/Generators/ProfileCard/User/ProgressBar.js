class ProgressBar {
    constructor(theme, user, width, progress) {
        this.theme = theme
        this.user = user
        this.width = width
        this.progress = progress

        this.height = 4
        this.r = this.height / 2
        this.fill = "#080D14"
        this.fillOverlay = "#5C6FF4"
    }
    
    getHeight() {
        return this.height
    }

    calculatePath(progress) {
        progress = Math.max(0.05, progress) // progress < 5% -> SVG looks odd
        const width = this.width * progress
        
        // Error correction
        const start = this.r + 1
        const end = width - this.r - 1

        return `M ${start} 0 L ${end} 0 a 1 1 1 0 1 0 ${this.height} L ${start} ${this.height} a 1 1 0 0 1 0 ${-this.height}`
    }

    toString() {
        return `
            <path d="${this.calculatePath(1)}" fill="${this.fill}"/>
            <path d="${this.calculatePath(this.progress)}" fill="${this.fillOverlay}"/>
        `
    }
}

module.exports = ProgressBar