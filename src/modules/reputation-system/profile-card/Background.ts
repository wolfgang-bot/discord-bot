import SVGComponent from "../../../lib/SVGComponent"
import { Theme } from "./ProfileCard"
import ReputationSystemConfig from "../models/Configuration"

export default class Background extends SVGComponent {
    theme: Theme

    constructor(config: ReputationSystemConfig, theme: Theme) {
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
