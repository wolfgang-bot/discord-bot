import React from "react"
import { Button, CircularProgress } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles(theme => ({
    loadingButton: {
        position: "relative",
        display: "inline-block"
    },

    loader: {
        position: "absolute",
        top: "50%", left: "50%",
        margin: "-12px 0 0 -12px"
    },
}))

function LoadingButton({ isLoading, children, ...props }) {
    const classes = useStyles()

    return (
        <div className={classes.loadingButton}>
            <Button disabled={isLoading} {...props}>
                {children}
            </Button>

            {isLoading && <CircularProgress size={24} className={classes.loader} />}
        </div>
    )
}

export default LoadingButton