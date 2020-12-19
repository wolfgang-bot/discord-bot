import React, { useState } from "react"
import RestartIcon from "@material-ui/icons/Replay"

import LoadingIconButton from "../Styled/LoadingIconButton.js"
import { restartModuleInstance } from "../../config/api.js"

function RestartButton({ module, guild, onUpdate, ...props }) {
    const [isLoading, setIsLoading] = useState(false)

    const handleClick = () => {
        setIsLoading(true)

        restartModuleInstance(guild.id, module.name)
            .finally(() => {
                setIsLoading(false)
                onUpdate()
            })
    }

    return (
        <LoadingIconButton isLoading={isLoading} onClick={handleClick} {...props}>
            <RestartIcon />
        </LoadingIconButton>
    )
}

export default RestartButton