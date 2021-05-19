import { ArgumentProps, TYPES as ARGUMENT_TYPES } from "../lib/Argument"

export const labelArgumentProps: ArgumentProps = {
    type: ARGUMENT_TYPES.STRING,
    key: "label",
    name: "Instance Label",
    defaultValue: "",
    desc: "Optional. Useful for telling instances of the same module apart"
}
