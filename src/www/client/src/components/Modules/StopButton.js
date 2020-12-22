import React, { useState } from "react"
import StopIcon from "@material-ui/icons/Stop"

import LoadingIconButton from "../Styled/LoadingIconButton.js"
import WebSocketAPI from "../../api/websocket/WebSocketAPI.js"

function StopButton({ module, guild, onUpdate, ...props }) {
    const [isLoading, setIsLoading] = useState(false)

    const handleStart = () => {
        setIsLoading(true)

        WebSocketAPI.stopModuleInstance(guild.id, module.name)
            .finally(() => {
                setIsLoading(false)
                onUpdate()
            })
    }

    return (
        <LoadingIconButton isLoading={isLoading} onClick={handleStart} {...props}>
            <StopIcon />
        </LoadingIconButton>
    )
}

export default StopButton