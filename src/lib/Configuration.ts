import Context from "./Context"

class Configuration {
    static guildConfig: object

    static fromArgs(args: any[]) {
        return new Configuration({})
    }

    static async fromJSON(context: Context, object: object) {
        return new Configuration({})
    }

    constructor(props: object) {}
    
    toJSON(): object {
        return {}
    }
}

export default Configuration