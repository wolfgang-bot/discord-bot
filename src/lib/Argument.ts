export enum TYPES {
    STRING = "string",
    NUMBER = "number",
    TEXT_CHANNEL = "text_channel",
    VOICE_CHANNEL = "voice_channel",
    CATEGORY_CHANNEL = "category_channel",
    ROLE = "role"
}

export type ArgumentProps = {
    type: TYPES,
    isArray?: boolean,
    key: string,
    name: string,
    desc: string,
    defaultValue?: any
}

class Argument implements ArgumentProps {
    type: TYPES
    isArray: boolean = false
    key: string
    name: string
    desc: string
    defaultValue?: any
    
    static TYPES = TYPES

    constructor(props: ArgumentProps) {
        this.type = props.type
        this.isArray = props.isArray
        this.key = props.key
        this.name = props.name
        this.desc = props.desc
        this.defaultValue = props.defaultValue
    }

    clone() {
        return new Argument({
            type: this.type,
            isArray: this.isArray,
            key: this.key,
            name: this.name,
            desc: this.desc,
            defaultValue: this.defaultValue
        })
    }
}

export default Argument
