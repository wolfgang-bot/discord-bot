export default class Configuration {
    static fromArgs(args: string[]): Configuration {
        return new Configuration({})
    }

    static fromJSON(context, object: object): Configuration {
        return new Configuration({})
    }

    constructor(props: object) {}
    
    toJSON(): object {
        return {}
    }
}