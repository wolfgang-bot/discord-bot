import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { useHistory } from "react-router-dom"
import { AppBar, Toolbar, Button, Grid, Divider } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"

import { logout } from "../../store/actions.js"
import DiscordOAuth from "../OAuth/DiscordOAuth.js"
import Avatar from "../User/Avatar.js"

const useStyles = makeStyles(theme => ({
    header: {
        ...theme.mixins.toolbar,
        backgroundColor: theme.palette.background.default,
        boxShadow: "none",
        marginBottom: theme.spacing(2),
        width: `calc(100% - ${250}px)`
    },

    toolbar: theme.mixins.toolbar,

    user: {
        display: "flex",
        alignContent: "center"
    },

    spacingRight: {
        marginRight: theme.spacing(2)
    }
}))

function Header() {
    const classes = useStyles()

    const history = useHistory()
    
    const dispatch = useDispatch()

    const isLoggedIn = useSelector(store => store.auth.isLoggedIn)

    const handleLogout = () => {
        history.push("/")
        dispatch(logout())
    }

    return (
        <AppBar className={classes.header} position="fixed">
            <Toolbar className={classes.toolbar}>
                <Grid item xs></Grid>

                <Grid item>
                    { !isLoggedIn ? (
                        <DiscordOAuth>Login</DiscordOAuth>
                    ) : (
                        <div className={classes.user}>
                            <Button onClick={handleLogout} variant="text" className={classes.spacingRight}>Logout</Button>

                            <Avatar/>
                        </div>
                    ) }
                </Grid>
            </Toolbar>

            <Divider/>
        </AppBar>
    )
}

export default Header