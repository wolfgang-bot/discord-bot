export enum TYPES {
    TEXT_CHANNEL = "text_channel",
    VOICE_CHANNEL = "voice_channel",
    CATEGORY_CHANNEL = "category_channel",
    ROLE = "role"
}

export type ArgumentProps = {
    type: TYPES
    key: string
    name: string
    desc: string
}

class Argument implements ArgumentProps {
    type: TYPES
    key: string
    name: string
    desc: string
    
    static TYPES = TYPES

    constructor(props: ArgumentProps) {
        this.type = props.type
        this.key = props.key
        this.name = props.name
        this.desc = props.desc
    }

    clone() {
        return new Argument({
            type: this.type,
            key: this.key,
            name: this.name,
            desc: this.desc
        })
    }
}

export default Argument
