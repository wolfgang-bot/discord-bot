import DefaultConfig from "../../../lib/Configuration"
import DescriptiveObject from "../../../lib/DescriptiveObject"
import { HEX_COLOR_REGEX } from "../../../lib/constraints"

export default class Configuration extends DefaultConfig {
    static guildConfig = new DescriptiveObject({
        value: {
            userRole: new DescriptiveObject({
                description: "Role each user receives when joining the guild",
                value: "User"
            }),
            
            colors: new DescriptiveObject({
                value: {
                    primary: new DescriptiveObject({
                        value: "#3f51b5",
                        constraints: "Must be a valid hexadecimal color-code",
                        verifyConstraints: (value) => HEX_COLOR_REGEX.test(value)
                    })
                }
            })
        }
    })

    static fromArgs() {
        return new Configuration({})
    }

    static async fromJSON() {
        return new Configuration({})
    }
}
