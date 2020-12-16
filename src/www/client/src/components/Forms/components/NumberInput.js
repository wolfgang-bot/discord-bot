import React, { useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { TextField } from "@material-ui/core"

function NumberInput({ onChange, ...props }) {
    const { register, setValue, watch, errors } = useFormContext()

    const handleChange = (event) => {
        const newValue = parseInt(event.target.value)
        setValue(props.name, newValue)

        if (onChange) {
            onChange(newValue)
        }
    }
    
    useEffect(() => {
        register(props.name)

        // eslint-disable-next-line
    }, [])
    
    const hasError = props.name in errors

    return (
        <TextField
            fullWidth
            variant="outlined"
            type="number"
            onChange={handleChange}
            value={watch(props.name)}
            error={hasError}
            helperText={hasError && errors[props.name].message}
            {...props}
        />
    )
}

export default NumberInput