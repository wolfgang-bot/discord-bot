import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { Link, useHistory } from "react-router-dom"
import { AppBar, Toolbar, Typography, Grid, Button } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"

import { logout } from "../../store/actions.js"
import DiscordOAuth from "../OAuth/DiscordOAuth.js"
import Avatar from "../User/Avatar.js"

const useStyles = makeStyles(theme => ({
    appBar: {
        backgroundColor: theme.palette.background.default,
        boxShadow: "none"
    },

    user: {
        display: "flex",
        alignContent: "center"
    },
    
    spacingRight: {
        marginRight: theme.spacing(2)
    }
}))

function Header({ title = "Javacript Bot" }) {
    const classes = useStyles()

    const history = useHistory()
    
    const dispatch = useDispatch()

    const isLoggedIn = useSelector(store => store.auth.isLoggedIn)

    const handleLogout = () => {
        history.push("/")
        dispatch(logout())
    }

    return (
        <AppBar className={classes.appBar} position="static">
            <Toolbar disableGutters>
                <Grid container justify="space-between">
                    <Link to="/">
                        <Typography color="textPrimary" variant="h6">{ title }</Typography>
                    </Link>

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
        </AppBar>
    )
}

export default Header