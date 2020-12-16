import React from "react"

import ArrayInput from "./ArrayInput.js"
import NumberInput from "./NumberInput.js"
import StringInput from "./StringInput.js"

const inputMap = {
    "Array": ArrayInput,
    "Number": NumberInput,
    "String": StringInput
}

function DynamicInput({ value, className, name, onChange }) {
    const Input = inputMap[value.constructor.name]

    if (!Input) {
        throw new Error(`No input component found for data type '${value.constructor.name}'`)
    }

    return (
        <div className={className}>
            <Input name={name} onChange={onChange}/>
        </div>
    )
}

export default DynamicInput