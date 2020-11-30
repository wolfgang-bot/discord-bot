import React from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Typography, Paper } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import { capitalCase } from "change-case"

import DynamicInput from "./components/DynamicInput.js"
import { createNestedElements } from "../../utils"

const useStyles = makeStyles(theme => ({
    titleWrapper: {
        margin: `${theme.spacing(2)}px 0`
    },

    container: {
        padding: theme.spacing(2),
        marginBottom: theme.spacing(6)
    },

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

function Title({ _key, desc }) {
    const classes = useStyles()
    
    return (
        <div className={classes.titleWrapper}>
            <Typography variant="h5">{capitalCase(_key)}</Typography>

            { desc && (
                <Typography variant="subtitle1">{ desc }</Typography>
            )}
        </div>
    )
}

function Input({ _key, value, desc }) {
    const classes = useStyles()

    return (
        <div className={classes.inputWrapper}>
            <div className={classes.inputLabelWrapper}>
                <Typography variant="subtitle1" className={classes.inputLabel}>{ capitalCase(_key) }</Typography>
                <Typography variant="caption">{ desc }</Typography>
            </div>

            <DynamicInput value={value} _key={_key} />
        </div>
    )
}

function ConfigForm({ data, onUpdate }) {
    const classes = useStyles()

    const form = useForm()

    const children = createNestedElements(data, {
        title: Title,
        leaf: Input,
        container: ({ children }) => (
            <Paper className={classes.container} variant="outlined">
                {children}
            </Paper>
        )
    })

    return (
        <FormProvider {...form}>
            { children }
        </FormProvider>
    )
}

export default ConfigForm