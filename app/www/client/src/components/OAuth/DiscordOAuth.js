import React, { useEffect, useRef } from "react"
import { Button } from "@material-ui/core"
import { useDispatch } from "react-redux"

import { createListeners } from "../../utils"
import { DISCORD_OAUTH_URL } from "../../config/constants.js"
import formatAPI, { USER } from "../../config/formatAPI.js"
import { login } from "../../store/actions.js"

function OAuthDiscord({ children }) {
    const dispatch = useDispatch()

    const popup = useRef()

    const handleClick = () => {
        const width = 1000
        const height = 800

        const x = window.innerWidth / 2 - width / 2
        const y = window.innerHeight / 2 - height / 2

        popup.current = window.open(DISCORD_OAUTH_URL, "Login with Discord", `width=${width},height=${height},left=${x},top=${y}`)
    }

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data?.source === "oauth" && popup.current) {
                popup.current.close()

                if (event.data.status === "ok") {
                    formatAPI(USER)({ data: event.data.payload.user })

                    dispatch(login({
                        user: event.data.payload.user,
                        token: event.data.payload.token
                    }))
                }
            }
        }

        return createListeners(window, [
            ["message", handleMessage]
        ])
    })

    return (
        <Button variant="contained" onClick={handleClick}>{ children }</Button>
    )
}

export default OAuthDiscord