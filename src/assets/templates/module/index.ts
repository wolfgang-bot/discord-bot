import Module from "../../lib/Module"
import { module } from "../../lib/decorators"
import Configuration from "./models/Configuration"

@module({
    key: "{MODULE_KEY}",
    name: "meta_name",
    desc: "meta_desc",
    features: "meta_features"
})
export default class Module {
    static makeConfigFromArgs = Configuration.fromArgs
    static makeConfigFromJSON = Configuration.fromJSON
    
    /**
     * Starts the module.
     * Code which needs to be run whenever the module is loaded should go here.
     */
    async start() { }

    /**
     * Stops the module.
     * Code which reverts the actions done in module.start should go here.
     */
    async stop() { }
}
