export enum TYPES {
    STRING = "string",
    NUMBER = "number",
    BOOLEAN = "boolean",
    TEXT_CHANNEL = "text_channel",
    VOICE_CHANNEL = "voice_channel",
    CATEGORY_CHANNEL = "category_channel",
    ROLE = "role"
}

export type ArgumentProps = {
    type: TYPES,
    isArray?: boolean,
    isSelect?: boolean,
    key: string,
    name: string,
    desc: string,
    defaultValue?: any,
    selectOptions?: any[]
}

class Argument implements ArgumentProps {
    type: TYPES
    isArray: boolean = false
    isSelect: boolean = false
    key: string
    name: string
    desc: string
    defaultValue?: any
    selectOptions?: any[]

    constructor(props: ArgumentProps) {
        if (props.isSelect && !props.selectOptions) {
            throw new Error("The argument tag 'isSelect' requires 'selectOptions' to be defined")
        }

        this.type = props.type
        this.isArray = props.isArray
        this.isSelect = props.isSelect
        this.key = props.key
        this.name = props.name
        this.desc = props.desc
        this.defaultValue = props.defaultValue
        this.selectOptions = props.selectOptions
    }

    clone() {
        return new Argument({
            type: this.type,
            isArray: this.isArray,
            isSelect: this.isSelect,
            key: this.key,
            name: this.name,
            desc: this.desc,
            defaultValue: this.defaultValue,
            selectOptions: this.selectOptions
        })
    }
}

export default Argument
