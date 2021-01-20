import React, { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { CssBaseline, CircularProgress, Typography } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"

import Router from "./router/index.js"
import { login } from "./store/actions.js"
import { getProfile } from "./config/api.js"
import WebSocketAPI from "./api/websocket/WebSocketAPI.js"

const useStyles = makeStyles({
    "@global": {
        a: {
            textDecoration: "none"
        }
    }
})

const shouldLogin = !!localStorage.getItem("token")

function App() {
    useStyles()

    const dispatch = useDispatch()

    const [isLoading, setIsLoading] = useState(shouldLogin)

    useEffect(() => {
        (async () => {
            if (shouldLogin) {
                try {
                    await WebSocketAPI.init(localStorage.getItem("token"))
                } catch(error) {
                    console.error(error)
                    localStorage.removeItem("token")
                    setIsLoading(false)
                    return
                }
                
                const { data: user } = await getProfile()

                dispatch(login({
                    token: localStorage.getItem("token"),
                    user
                }))

                setIsLoading(false)
            }
        })()

        // eslint-disable-next-line
    }, [])

    return (
        <>
            <CssBaseline/>

            { isLoading ? (
                <>
                    <Typography>Logging in...</Typography>
                    <CircularProgress />
                </>
            ) : (
                <Router />
            )}
        </>
    )
}

export default App