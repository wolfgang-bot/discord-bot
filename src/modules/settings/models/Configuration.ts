import DefaultConfig from "../../../lib/Configuration"
import DescriptiveObject from "../../../lib/DescriptiveObject"
import { HEX_COLOR_REGEX } from "../../../lib/constraints"
import Context from "../../../lib/Context"

type ConfigProps = {
    commandPrefix: string,
    locale: string,
    colorPrimary: string
}

type ConfigArgs = [string, string, string]

type ConfigJSON = ConfigProps

export default class Configuration extends DefaultConfig implements ConfigProps {
    commandPrefix: string
    locale: string
    colorPrimary: string

    static guildConfig = new DescriptiveObject({
        value: {}
    })

    static fromArgs([commandPrefix, locale, colorPrimary]: ConfigArgs) {
        if (!HEX_COLOR_REGEX.test(colorPrimary)) {
            throw "'Color Primary' must be a valid hexadecimal color"
        }

        return new Configuration({ commandPrefix, locale, colorPrimary })
    }

    static async fromJSON(context: Context, json: ConfigJSON) {
        return new Configuration(json)
    }

    constructor(props: ConfigProps) {
        super(props)
        this.commandPrefix = props.commandPrefix
        this.locale = props.locale
        this.colorPrimary = props.colorPrimary
    }

    toJSON(): ConfigJSON {
        return {
            commandPrefix: this.commandPrefix,
            locale: this.locale,
            colorPrimary: this.colorPrimary
        }
    }
}
