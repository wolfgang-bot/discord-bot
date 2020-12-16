import React from "react"
import { useFormContext } from "react-hook-form"
import { TextField } from "@material-ui/core"

function StringInput({ onChange, ...props }) {
    const { register, errors } = useFormContext()
    
    const handleChange = (event) => {
        if (onChange) {
            onChange(event.target.value)
        }
    }

    const hasError = props.name in errors

    return (
        <TextField
            fullWidth
            variant="outlined"
            inputRef={register()}
            onChange={handleChange}
            error={hasError}
            helperText={hasError && errors[props.name].message}
            {...props}
        />
    )
}

export default StringInput