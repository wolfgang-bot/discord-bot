import DefaultConfig from "../../../lib/Configuration"
import DescriptiveObject from "../../../lib/DescriptiveObject"
import { HEX_COLOR_REGEX } from "../../../lib/constraints"

type ConfigProps = {
    commandPrefix: string,
    locale: string,
    colorPrimary: string
}

export default class Configuration extends DefaultConfig implements ConfigProps {
    commandPrefix: string
    locale: string
    colorPrimary: string

    static guildConfig = new DescriptiveObject({
        value: {}
    })

    constructor(props: ConfigProps) {
        super(props)
        
        if (!HEX_COLOR_REGEX.test(this.colorPrimary)) {
            throw "'Color Primary' must be a valid hexadecimal color"
        }
    }
}
