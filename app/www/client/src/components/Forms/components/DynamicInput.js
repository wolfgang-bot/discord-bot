import React from "react"
import { TextField } from "@material-ui/core"

function DynamicInput({ value, className }) {
    return (
        <div className={className}>
            <TextField value={value} fullWidth variant="outlined"/>
        </div>
    )
}

export default DynamicInput