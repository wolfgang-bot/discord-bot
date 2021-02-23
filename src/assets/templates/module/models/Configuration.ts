import DefaultConfig from "@personal-discord-bot/shared/dist/module/Configuration"
import Context from "@personal-discord-bot/shared/dist/module/Context"

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
