import Module from "../../lib/Module"
import { module, _static } from "../../lib/decorators"
import Configuration from "./models/Configuration"

@module({
    key: "settings",
    name: "meta_name",
    desc: "meta_desc"
})
@_static
export default class SettingsModule extends Module {
    static makeConfigFromArgs = Configuration.fromArgs
    static makeConfigFromJSON = Configuration.fromJSON

    async start() {}
    async stop() {}
}
