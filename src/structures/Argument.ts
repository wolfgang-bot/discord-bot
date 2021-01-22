enum TYPES {
    TEXT_CHANNEL = "text_channel",
    VOICE_CHANNEL = "voice_channel",
    CATEGORY_CHANNEL = "category_channel"
}

export type ArgumentProps = {
    type: TYPES
    name: string
    displayName: string
    desc: string
}

class Argument implements ArgumentProps {
    type: TYPES
    name: string
    displayName: string
    desc: string
    
    static TYPES = TYPES

    constructor(props: ArgumentProps) {
        this.type = props.type
        this.name = props.name
        this.displayName = props.displayName
        this.desc = props.desc
    }
}

export default Argument