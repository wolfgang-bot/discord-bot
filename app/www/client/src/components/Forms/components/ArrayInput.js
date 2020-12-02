import React, { useState, useEffect, useRef } from "react"
import { useFormContext, useForm, FormProvider, useWatch } from "react-hook-form"
import { Grid, IconButton, Button, Typography } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import DeleteIcon from "@material-ui/icons/Close"
import AddIcon from "@material-ui/icons/Add"

import DynamicInput from "./DynamicInput.js"

const useStyles = makeStyles(theme => ({
    inputWrapper: {
        marginBottom: theme.spacing(1)
    },
    
    error: {
        display: "block",
        marginTop: theme.spacing(1)
    }
}))

function ArrayInput(props) {
    const classes = useStyles()

    const { register, setValue, control, errors } = useFormContext()

    const values = useWatch({ control, name: props.name })

    const form = useForm({
        defaultValues: values
    })

    const idCounter = useRef(0)

    const [inputIds, setInputIds] = useState(() => values.map(() => idCounter.current++))

    const handleChange = () => {
        const newValues = Object.values(form.watch())
        setValue(props.name, newValues)
    }

    const handleAdd = () => {
        inputIds.push(idCounter.current++)
        setInputIds([...inputIds])
    }

    const handleRemove = (id) => {
        const newValues = form.watch()
        delete newValues[id]
        setValue(props.name, Object.values(newValues))

        // Remove id from inputIds
        const index = inputIds.indexOf(id)
        inputIds.splice(index, 1)
        setInputIds([...inputIds])
    }
    
    useEffect(() => {
        register(props.name)
    }, [])

    const hasError = props.name in errors

    return (
        <FormProvider {...form}>
            { inputIds.map((id) => (
                <Grid container className={classes.inputWrapper} wrap="nowrap" spacing={1} key={id}>
                    <Grid item xs={12}>
                        <DynamicInput
                            value={values[0]}
                            name={id.toString()}
                            onChange={handleChange}
                        />
                    </Grid>

                    <Grid item xs container alignItems="center">
                        { inputIds.length > 1 && (
                            <IconButton onClick={() => handleRemove(id)}>
                                <DeleteIcon />
                            </IconButton>
                        )}
                    </Grid>
                </Grid>
            )) }

            <Grid container>
                <Button onClick={handleAdd} startIcon={<AddIcon />} variant="outlined">
                    Add
                </Button>
            </Grid>

            { hasError && (
                <Typography variant="caption" color="error" className={classes.error}>
                    { errors[props.name].message}
                </Typography>
            )}
        </FormProvider>
    )
}

export default ArrayInput