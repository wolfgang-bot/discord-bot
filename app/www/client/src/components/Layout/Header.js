import React from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { AppBar, Toolbar, Typography, Grid } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"

import DiscordOAuth from "../OAuth/DiscordOAuth.js"

const useStyles = makeStyles(theme => ({
    appBar: {
        backgroundColor: theme.palette.background.default,
        boxShadow: "none"
    }
}))

function Header({ title = "Javacript Bot" }) {
    const classes = useStyles()

    const isLoggedIn = useSelector(store => store.auth.isLoggedIn)
    const user = useSelector(store => store.auth.user)

    return (
        <AppBar className={classes.appBar} position="static">
            <Toolbar disableGutters>
                <Grid container justify="space-between">
                    <Link to="/">
                        <Typography color="textPrimary" variant="h6">{ title }</Typography>
                    </Link>


                    { !isLoggedIn ? (
                        <DiscordOAuth />
                    ) : (
                        <Typography color="textPrimary" variant="subtitle1">{ user.username }</Typography>
                    )}
                </Grid>
            </Toolbar>
        </AppBar>
    )
}

export default Header