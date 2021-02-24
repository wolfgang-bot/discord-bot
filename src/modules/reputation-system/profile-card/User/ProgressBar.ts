import { SVGComponent } from "@personal-discord-bot/shared/dist"
import Member from "@personal-discord-bot/shared/dist/models/Member"
import { Theme } from "../ProfileCard"

export default class ProgressBar extends SVGComponent {
    member: Member
    width: number
    progress: number
    height: number = 4
    r: number = this.height / 2
    fill: string = "#080D14"
    fillOverlay: string = "#5C6FF4"

    constructor(config, theme: Theme, member: Member, width: number, progress: number) {
        super()
        this.member = member
        this.width = width
        this.progress = progress
    }

    getWidth() {
        return this.width
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
