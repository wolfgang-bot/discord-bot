import React, { useState, useMemo } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Typography, Paper, Button } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import { capitalCase } from "change-case"

import DynamicInput from "./components/DynamicInput.js"
import LoadingButton from "./components/LoadingButton.js"
import { createNestedElements, createNestedObject, KEY_DELIMITER } from "../../utils"
import { setConfig } from "../../config/api.js"

const useStyles = makeStyles(theme => ({
    titleWrapper: {
        margin: `${theme.spacing(2)}px 0`
    },

    container: {
        padding: theme.spacing(2),
        marginBottom: theme.spacing(6),
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

    // Use the last portion of the combined key as label (e.g. "one#to#three" -> "three")
    const label = _key.split(KEY_DELIMITER).pop()

    return (
        <div className={classes.inputWrapper}>
            <div className={classes.inputLabelWrapper}>
                <Typography variant="subtitle1" className={classes.inputLabel}>{ capitalCase(label) }</Typography>
                <Typography variant="caption">{ desc }</Typography>
            </div>

            <DynamicInput value={value} name={_key}/>
        </div>
    )
}

function ConfigForm({ guildId, data, onUpdate }) {
    const classes = useStyles()

    const [children, keys] = useMemo(() => {
        return createNestedElements(data, {
            title: Title,
            leaf: Input,
            container: ({ children }) => (
                <Paper className={classes.container} variant="outlined">
                    {children}
                </Paper>
            )
        })
    }, [data])

    const form = useForm({
        defaultValues: keys
    })

    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = (values) => {
        // Format keys back to object
        const data = createNestedObject(values)

        setIsLoading(true)

        setConfig(guildId, data)
            .then(console.log)
            .catch(console.error)
            .finally(() => setIsLoading(false))
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                { children }

                <LoadingButton
                    type="submit"
                    variant="contained"
                    color="primary"
                    isLoading={isLoading}
                >
                    Save
                </LoadingButton>
            </form>
        </FormProvider>
    )
}

export default ConfigForm