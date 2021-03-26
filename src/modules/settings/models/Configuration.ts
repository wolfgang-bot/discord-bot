import Discord from "discord.js"
import DefaultConfig, { Validator } from "../../../lib/Configuration"
import { HEX_COLOR_REGEX } from "../../../lib/constraints"

const COMMAND_PREFIX_MAX_LENGTH = 8

type ConfigProps = {
    commandPrefix: string,
    locale: string,
    colorPrimary: string,
    adminRoles: Discord.Role[]
}

export type ConfigJSON = Omit<ConfigProps, "adminRoles"> & {
    adminRoles: string[]
}

export default class Configuration extends DefaultConfig implements ConfigProps {
    commandPrefix: string
    locale: string
    colorPrimary: string
    adminRoles: Discord.Role[]

    static validators: Validator<ConfigProps>[] = [
        {
            key: "commandPrefix",
            validate: (props) => props.commandPrefix.length > 0,
            message: "Cannot be empty"
        },
        {
            key: "commandPrefix",
            validate: (props) => props.commandPrefix.length <= COMMAND_PREFIX_MAX_LENGTH,
            message: `Cannot be longer than ${COMMAND_PREFIX_MAX_LENGTH} characters`
        },
        {
            key: "colorPrimary",
            validate: (props) => HEX_COLOR_REGEX.test(props.colorPrimary),
            message: "Must be a valid hexadecimal color"
        }
    ]

    constructor(props: ConfigProps) {
        super(props)
        Configuration.validate(props)
    }

    toJSON() {
        return {
            ...this,
            adminRoles: this.adminRoles.map(role => role.id)
        }
    }
}
