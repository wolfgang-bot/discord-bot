class Avatar {
    constructor(theme, uri) {
        this.theme = theme
        this.uri = uri

        this.size = 64
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

module.exports = Avatar