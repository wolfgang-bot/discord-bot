import Module from "../../lib/Module"
import { module, argument } from "../../lib/decorators"
import { TYPES as ARGUMENT_TYPES } from "../../lib/Argument"
import Configuration from "./models/Configuration"
import LocaleProvider from "../../services/LocaleProvider"

@module({
    key: "settings",
    name: "Settings",
    desc: "Provides guild-specific settings for the bot.",
    isStatic: true,
    canUpdateConfig: true
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    key: "commandPrefix",
    defaultValue: "?",
    name: "Command Prefix",
    desc: "Prefix needed to run commands"
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    key: "locale",
    isSelect: true,
    selectOptions: LocaleProvider.getLocaleKeys(),
    defaultValue: LocaleProvider.defaultLocale,
    name: "Locale",
    desc: "Locale of the guild (used for translations)"
})
@argument({
    type: ARGUMENT_TYPES.ROLE,
    key: "adminRoles",
    defaultValue: [],
    isArray: true,
    allowEmptyArray: true,
    name: "Admin Roles",
    desc: "Roles which can administrate the bot"
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    key: "colorPrimary",
    defaultValue: "#3f51b5",
    name: "Color Primary",
    desc: "Primary color of the color theme (used in embeds)"
})
export default class SettingsModule extends Module {
    static config = Configuration

    async start() {}
    async stop() {}
}
