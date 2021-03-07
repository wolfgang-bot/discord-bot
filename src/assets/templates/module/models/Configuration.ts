import DefaultConfig from "../../../lib/Configuration"

type ConfigProps = {}

export default class Configuration extends DefaultConfig implements ConfigProps {
    constructor(props: ConfigProps) {
        super()
    }

    toJSON() {
        return {
            ...this
        }
    }
}
