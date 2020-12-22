import React, { useState } from "react"
import StartIcon from "@material-ui/icons/PlayArrow"

import LoadingIconButton from "../Styled/LoadingIconButton.js"
import WebSocketAPI from "../../api/websocket/WebSocketAPI.js"

function StartButton({ module, guild, onUpdate, ...props }) {
    const [isLoading, setIsLoading] = useState(false)

    const handleClick = () => {
        WebSocketAPI.startModuleInstance(guild.id, module.name)
            .finally(() => setIsLoading(false))
    }

    return (
        <LoadingIconButton isLoading={isLoading} onClick={handleClick} {...props}>
            <StartIcon />
        </LoadingIconButton>
    )
}

export default StartButton