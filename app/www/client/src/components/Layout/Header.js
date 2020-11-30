import React from "react"
import { AppBar, Toolbar, Typography } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles(theme => ({
    appBar: {
        backgroundColor: theme.palette.background.default,
        boxShadow: "none"
    }
}))

function Header({ title = "Javacript Bot" }) {
    const classes = useStyles()

    return (
        <AppBar className={classes.appBar} position="static">
            <Toolbar disableGutters>
                <Typography color="textPrimary" variant="h6">{ title }</Typography>
            </Toolbar>
        </AppBar>
    )
}

export default Header