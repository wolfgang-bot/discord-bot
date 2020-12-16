import React from "react"
import { Container } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"

import Header from "./Header.js"
import ComponentOpener from "../ComponentOpener/ComponentOpener.js"
import Sidebar from "../Sidebar/Sidebar.js"

const useStyles = makeStyles(theme => ({
    layout: {
        display: "flex"
    },

    body: {
        width: `calc(100% - ${250}px)`,
        marginTop: theme.spacing(12),
        marginBottom: theme.spacing(8)
    },

    content: {
        display: props => props.center && "flex",
        flexDirection: props => props.center && "column",
        alignItems: props => props.center && "center"
    }
}))

function Layout({ headerProps = {}, sidebarProps = {}, children, center = false }) {
    const classes = useStyles({ center })

    return (
        <div className={classes.layout}>
            <Header {...headerProps}/>

            <Sidebar {...sidebarProps}/>

            <div className={classes.body}>
                <Container className={classes.content}>
                    { children }
                </Container>
            </div>

            <ComponentOpener/>
        </div>
    )
}

export default Layout