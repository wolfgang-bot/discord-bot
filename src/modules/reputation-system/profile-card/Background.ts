import { SVGComponent } from "@personal-discord-bot/shared/dist"
import { Theme } from "./ProfileCard"

export default class Background extends SVGComponent {
    theme: Theme

    constructor(config, theme: Theme) {
        super()
        this.theme = theme
    }

    getWidth() {
        return this.theme.width
    }

    getHeight() {
        return 0
    }

    toString() {
        return `<rect width="100%" height="100%" fill="${this.theme.backgroundColor}"/>`
    }
}
