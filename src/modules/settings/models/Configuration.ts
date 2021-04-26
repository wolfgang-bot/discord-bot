import Discord from "discord.js"
import DefaultConfig, { Validator } from "../../../lib/Configuration"
import { hexColorConstraint, minMaxConstraint, useConstraint } from "../../../lib/constraints"

const COMMAND_PREFIX_MIN_LENGTH = 1
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

const commandPrefixConstraint = minMaxConstraint({
    min: COMMAND_PREFIX_MIN_LENGTH,
    max: COMMAND_PREFIX_MAX_LENGTH,
    subjectName: "Length",
    getNumericValue: (value: string) => value.length
})

export default class Configuration extends DefaultConfig implements ConfigProps {
    commandPrefix: string
    locale: string
    colorPrimary: string
    adminRoles: Discord.Role[]

    static validators: Validator<ConfigProps>[] = [
        useConstraint<ConfigProps, string>("commandPrefix", commandPrefixConstraint),
        useConstraint<ConfigProps, string>("colorPrimary", hexColorConstraint)
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
