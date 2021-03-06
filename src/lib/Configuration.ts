class Configuration {
    static guildConfig: object

    constructor(props: object) {
        for (let key in props) {
            this[key] = props[key]
        }
    }
}

export default Configuration
