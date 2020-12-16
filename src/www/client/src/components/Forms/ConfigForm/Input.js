import React from "react"
import { useFormContext } from "react-hook-form"
import { Typography } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import { capitalCase } from "change-case"

import DynamicInput from "../components/DynamicInput.js"
import { KEY_DELIMITER } from "../../../utils"

const useStyles = makeStyles(theme => ({
    inputWrapper: {
        margin: `${theme.spacing(2)}px 0`,

        "&:first-child": {
            marginTop: 0
        },

        "&:last-child": {
            marginBottom: 0
        }
    },

    inputLabelWrapper: {
        marginBottom: theme.spacing(.5)
    },

    inputLabel: {
        lineHeight: "unset"
    }
}))

function Input({ _key, value, desc }) {
    const classes = useStyles()

    const { errors } = useFormContext()

    // Use the last portion of the combined key as label (e.g. "one#to#three" -> "three")
    const label = _key.split(KEY_DELIMITER).pop()

    const hasError = Object.keys(errors).some(key => key.startsWith(_key))
    const textColor = hasError ? "error" : undefined

    return (
        <div className={classes.inputWrapper}>
            <div className={classes.inputLabelWrapper}>
                <Typography variant="subtitle1" className={classes.inputLabel} color={textColor}>{capitalCase(label)}</Typography>
                <Typography variant="caption" color={textColor}>{desc}</Typography>
            </div>

            <DynamicInput value={value} name={_key} />
        </div>
    )
}

export default Input