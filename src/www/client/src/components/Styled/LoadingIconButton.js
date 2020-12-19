import React from "react"
import clsx from "clsx"
import { IconButton, CircularProgress } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles(theme => ({
    loadingButton: {
        position: "relative"
    },

    loader: {
        position: "absolute",
        top: "50%", left: "50%",
        margin: "-12px 0 0 -12px"
    },
}))

function LoadingIconButton({ isLoading, children, className, ...props }) {
    const classes = useStyles()

    return (
        <div className={clsx(classes.loadingButton, className)}>
            <IconButton disabled={isLoading} {...props}>
                {children}
            </IconButton>

            {isLoading && <CircularProgress size={24} className={classes.loader} />}
        </div>
    )
}

export default LoadingIconButton