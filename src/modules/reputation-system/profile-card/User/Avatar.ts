import SVGComponent from "../../../../lib/SVGComponent"
import { Theme } from "../ProfileCard"

export default class Avatar extends SVGComponent {
    uri: string
    size: number = 64

    constructor(config, theme: Theme, uri: string) {
        super()
        this.uri = uri
    }

    getWidth() {
        return this.size
    }

    getHeight() {
        return this.size
    }

    toString() {
        return `
            <clipPath id="clipCircleAvatar">
                <circle
                    r="${this.size / 2}"
                    cx="${this.size / 2}"
                    cy="${this.size / 2}"
                />
            </clipPath>
            
            <image
                width="${this.size}"
                height="${this.size}"
                xlink:href="data:image/png;base64,${this.uri}"
                clip-path="url(#clipCircleAvatar)"
            />
        `
    }
}