import DefaultConfig, { Validator } from "../../../lib/Configuration"
import { channelNameConstraint, useConstraint } from "../../../lib/constraints"

type ConfigProps = {
    channelName: string
}

export default class Configuration extends DefaultConfig implements ConfigProps {
    channelName: string

    static validators: Validator<ConfigProps>[] = [
        useConstraint<ConfigProps, string>("channelName", channelNameConstraint),
        {
            key: "channelName",
            validate: ({ channelName }) => channelName.includes("{}"),
            message: "Must include '{}'"
        }
    ]

    constructor(props: ConfigProps) {
        super(props)
        Configuration.validate(props)
    }
}
