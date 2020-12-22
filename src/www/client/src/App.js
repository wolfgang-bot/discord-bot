import React, { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { CssBaseline, CircularProgress, Typography } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"

import Router from "./router/index.js"
import { login } from "./store/actions.js"
import { getProfile } from "./config/api.js"
import WebSocketAPI from "./api/WebSocketAPI.js"

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
        if (shouldLogin) {
            getProfile()
                .then(res => dispatch(login({
                    token: localStorage.getItem("token"),
                    user: res.data
                })))
                .catch(() => {
                    localStorage.removeItem("token")
                })
                .finally(() => setIsLoading(false))
        }

        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        (async () => {
            await WebSocketAPI.login(localStorage.getItem("token"))
        })()
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