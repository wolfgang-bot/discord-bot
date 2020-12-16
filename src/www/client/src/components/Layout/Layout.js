import React from "react"
import { makeStyles } from "@material-ui/core/styles"

import Header from "./Header.js"
import ComponentOpener from "../ComponentOpener/ComponentOpener.js"
import Sidebar from "../Sidebar/Sidebar.js"

const useStyles = makeStyles(theme => ({
    body: {
        display: props => props.center && "flex",
        flexDirection: props => props.center && "column",
        alignItems: props => props.center && "center",
        marginBottom: theme.spacing(8)
    }
}))

function Layout({ headerProps = {}, children, center = false }) {
    const classes = useStyles({ center })

    return (
        <div>
            <Header {...headerProps}/>

            <Sidebar/>

            <div className={classes.body}>
                { children }
            </div>

            <ComponentOpener/>
        </div>
    )
}

export default Layout