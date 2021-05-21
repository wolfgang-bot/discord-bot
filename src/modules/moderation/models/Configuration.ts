import DefaultConfig from "../../../lib/Configuration"

type ConfigProps = {
    mutedRoleName: string
}

export default class Configuration extends DefaultConfig implements ConfigProps {
    mutedRoleName: string
}
