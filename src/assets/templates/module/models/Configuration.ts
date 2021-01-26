import DefaultConfig from "../../../lib/Configuration"
import Context from "../../../lib/Context"

type ConfigProps = {}

type ConfigArgs = []

type ConfigJSON = {}

export default class Configuration extends DefaultConfig implements ConfigProps {
    static fromArgs(args: ConfigArgs) {
        return new Configuration({ })
    }

    static async fromJSON(context: Context, object: ConfigJSON) {
        return new Configuration({ })
    }

    constructor(props: ConfigProps) {
        super()
    }

    toJSON(): ConfigJSON {
        return {}
    }
}