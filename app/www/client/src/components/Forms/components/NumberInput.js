import React, { useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { TextField } from "@material-ui/core"

function NumberInput({ onChange, ...props }) {
    const { register, setValue, watch } = useFormContext()

    const handleChange = (event) => {
        const newValue = parseInt(event.target.value)
        setValue(props.name, newValue)

        if (onChange) {
            onChange(newValue)
        }
    }
    
    useEffect(() => {
        register(props.name)
    }, [])

    return (
        <TextField
            fullWidth
            variant="outlined"
            type="number"
            onChange={handleChange}
            value={watch(props.name)}
            {...props}
        />
    )
}

export default NumberInput