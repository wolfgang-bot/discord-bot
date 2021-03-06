class Configuration {
    constructor(props: object) {
        for (let key in props) {
            this[key] = props[key]
        }
    }
}

export default Configuration
