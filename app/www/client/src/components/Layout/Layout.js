import React from "react"
import { Container } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"

import Header from "./Header.js"
import ComponentOpener from "../ComponentOpener/ComponentOpener.js"

const useStyles = makeStyles(theme => ({
    body: {
        marginBottom: theme.spacing(8)
    }
}))

function Layout({ headerProps = {}, children }) {
    const classes = useStyles()

    return (
        <Container>
            <Header {...headerProps}/>

            <div className={classes.body}>
                { children }
            </div>

            <ComponentOpener/>
        </Container>
    )
}

export default Layout