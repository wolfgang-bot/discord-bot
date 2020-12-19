import React, { useState } from "react"
import StopIcon from "@material-ui/icons/Stop"

import LoadingIconButton from "../Styled/LoadingIconButton.js"
import { stopModuleInstance } from "../../config/api.js"

function StopButton({ module, guild, onUpdate, ...props }) {
    const [isLoading, setIsLoading] = useState(false)

    const handleStart = () => {
        setIsLoading(true)

        stopModuleInstance(guild.id, module.name)
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