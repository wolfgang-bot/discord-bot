import React, { useState, useEffect, useRef, useReducer } from "react"
import { useTheme } from "@material-ui/core"

import { createListeners } from "../../utils"
import createSnackbarOpener from "./snackbar.js"
import Emittable from "../../Models/Emittable.js"

const openers = {
    Snackbar: createSnackbarOpener
}

const methods = {}

function ComponentOpener() {
    const theme = useTheme()

    const eventTarget = useRef(new Emittable())

    const [components, setComponents] = useState([])

    // eslint-disable-next-line
    const [updateKey, update] = useReducer(key => key + 1, 0)

    const close = (component) => {
        component.isOpen = false
        setComponents([...components])

        setTimeout(() => eventTarget.current.dispatchEvent("removeComponent", component), theme.transitions.duration.leavingScreen)
    }

    const remove = (component) => {
        const newComponent = components.filter(({ id }) => component.id !== id)
        setComponents(newComponent)
    }

    useEffect(() => {
        const open = (handle) => {
            setComponents([...components, handle])

            return handle
        }

        for (let name in openers) {
            methods["open" + name] = openers[name](open)
        }

        const removeListeners = components.map(component => createListeners(component, [
            ["update", update],
            ["close", () => requestAnimationFrame(() => close(component))]
        ]))

        return () => removeListeners.forEach(fn => fn())
    })

    useEffect(() => {
        return createListeners(eventTarget.current, [
            ["removeComponent", remove]
        ])
    })

    return components.map((component) => (
        React.createElement(component.component, {
            open: component.isOpen,
            onClose: data => component.dispatchEvent("close", data),
            key: component.id,
            ...component.data
        })
    ))
}

export default ComponentOpener

export const opener = methods