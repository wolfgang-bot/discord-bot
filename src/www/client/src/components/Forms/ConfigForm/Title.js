import React from "react"
import { useFormContext } from "react-hook-form"
import { Typography} from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import { capitalCase } from "change-case"

import { KEY_DELIMITER } from "../../../utils"

const useStyles = makeStyles(theme => ({
    title: {
        margin: `${theme.spacing(2)}px 0`
    }
}))

function Title({ _key, desc }) {
    const classes = useStyles()

    const { errors } = useFormContext()

    const label = _key.split(KEY_DELIMITER).pop()

    const hasError = Object.keys(errors).some(key => key.startsWith(_key))
    const textColor = hasError ? "error" : undefined

    return (
        <div className={classes.title}>
            <Typography variant="h5" color={textColor}>{capitalCase(label)}</Typography>

            { desc && (
                <Typography variant="subtitle1" color={textColor}>{desc}</Typography>
            )}
        </div>
    )
}
export default Title