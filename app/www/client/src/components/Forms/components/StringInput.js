import React from "react"
import { useFormContext } from "react-hook-form"
import { TextField } from "@material-ui/core"

function StringInput({ onChange, ...props }) {
    const { register } = useFormContext()
    
    const handleChange = (event) => {
        if (onChange) {
            onChange(event.target.value)
        }
    }

    return (
        <TextField
            fullWidth
            variant="outlined"
            inputRef={register()}
            onChange={handleChange}
            {...props}
        />
    )
}

export default StringInput