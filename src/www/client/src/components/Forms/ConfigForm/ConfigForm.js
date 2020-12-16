import React, { useState, useMemo } from "react"
import { Redirect } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form"
import { Paper, CircularProgress } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"

import LoadingButton from "../components/LoadingButton.js"
import Title from "./Title.js"
import Input from "./Input.js"
import { createNestedElements, createNestedObject, flattenObject } from "../../../utils"
import { setConfig } from "../../../config/api.js"
import { opener } from "../../ComponentOpener/ComponentOpener.js"
import useAPIData from "../../../utils/useAPIData.js"

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

function ConfigForm({ guild, data }) {
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

        // eslint-disable-next-line
    }, [data])

    const form = useForm({
        defaultValues: keys
    })

    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = (values) => {
        // Format keys back to object
        const data = createNestedObject(values)

        setIsSubmitting(true)

        setConfig(guild.id, data)
            .then(() => {
                opener.openSnackbar("Success!")
            })
            .catch((error) => {
                const flattened = flattenObject(error.response.data)

                for (let key in flattened) {
                    form.setError(key, {
                        message: flattened[key]
                    })
                }
            })
            .finally(() => setIsSubmitting(false))
    }

    return (
        <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                { children }

                <LoadingButton
                    type="submit"
                    variant="contained"
                    color="primary"
                    isLoading={isSubmitting}
                >
                    Save
                </LoadingButton>
            </form>
        </FormProvider>
    )
}

function ConfigFormWrapper({ guild }) {
    const { data, isLoading, error } = useAPIData({
        method: "getConfigDescriptive",
        data: guild.id
    })

    if (isLoading) {
        return <CircularProgress/>
    }

    if (error?.response.status === 404) {
        return <Redirect to="/not-found"/>
    }

    return <ConfigForm guild={guild} data={data}/>
}

export default ConfigFormWrapper