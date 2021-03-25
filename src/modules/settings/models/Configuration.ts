import DefaultConfig from "../../../lib/Configuration"
import { HEX_COLOR_REGEX } from "../../../lib/constraints"

const COMMAND_PREFIX_MAX_LENGTH = 8

type ConfigProps = {
    commandPrefix: string,
    locale: string,
    colorPrimary: string
}

export default class Configuration extends DefaultConfig implements ConfigProps {
    commandPrefix: string
    locale: string
    colorPrimary: string

    constructor(props: ConfigProps) {
        super(props)
        
        if (this.commandPrefix.length > COMMAND_PREFIX_MAX_LENGTH) {
            throw `'Command Prefix' cannot be longer than ${COMMAND_PREFIX_MAX_LENGTH} characters`
        }

        if (!HEX_COLOR_REGEX.test(this.colorPrimary)) {
            throw "'Color Primary' must be a valid hexadecimal color"
        }
    }
}
