import Module from "../../lib/Module"
import { module, _static, argument } from "../../lib/decorators"
import { TYPES as ARGUMENT_TYPES } from "../../lib/Argument"
import Configuration from "./models/Configuration"
import LocaleProvider from "../../services/LocaleProvider"

@module({
    key: "settings",
    name: "meta_name",
    desc: "meta_desc"
})
@_static
@argument({
    type: ARGUMENT_TYPES.STRING,
    key: "commandPrefix",
    defaultValue: "?",
    name: "arg_command_prefix_name",
    desc: "arg_command_prefix_desc"
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    key: "locale",
    isSelect: true,
    selectOptions: LocaleProvider.getLocaleKeys(),
    defaultValue: LocaleProvider.defaultLocale,
    name: "arg_locale_name",
    desc: "arg_locale_desc"
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    key: "colorPrimary",
    defaultValue: "#3f51b5",
    name: "arg_color_primary_name",
    desc: "arg_color_primary_desc"
})
export default class SettingsModule extends Module {
    static config = Configuration

    async start() {}
    async stop() {}
}
