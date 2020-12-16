import React from "react"

export const KEY_DELIMITER = "#"

/**
 * Make an array of components which render a descriptive object recursively and return
 * the flattened keys.
 * 
 * @param {Object} data Descriptive object
 * @param {Object} components Rendered components
 * @param {Function} components.title Sub-Object's Key
 * @param {Function} components.container Container for sub-object's values
 * @param {Function} components.leaf Value where no further recursion happens
 * @returns {[Array<React.Element>, Object]} Elements and the backtracable key-value pairs 
 */
export function createNestedElements(data, components) {
    const keys = {}

    function _create(data, keyCarry = "", depth = 0) {
        const elements = []

        for (let key in data) {
            const value = data[key].value
            const desc = data[key].description

            const backtraceKey = keyCarry + key
            
            if (value.constructor.name === "Object") {
                elements.push(React.createElement(components.title, {
                    key: backtraceKey + "title",
                    _key: backtraceKey,
                    desc,
                    depth
                }))
                
                // Recursively create elements with depth += 1
                elements.push(React.createElement(components.container, {
                    key: keyCarry + key + "container",
                    children: _create(value, backtraceKey + KEY_DELIMITER, depth + 1)
                }))
            } else {
                elements.push(React.createElement(components.leaf, {
                    key: backtraceKey + "leaf",
                    _key: backtraceKey,
                    value,
                    desc,
                    depth
                }))

                keys[backtraceKey] = value
            }
        }

        return elements
    }

    return [_create(data), keys]
}

/**
 * Create a nested object based on keys delimitted by the KEY_DELIMITER constant.
 * e.g. the keys "foo#bar" and "foo#baz" become: { foo: { bar, baz } }
 * 
 * @param {Object} values the flat key-value pairs
 * @returns {Object} Multi-dimensional object based
 */
export function createNestedObject(values) {
    const result = {}

    for (let key in values) {
        // Split the key up into the 
        const finalKeys = key.split(KEY_DELIMITER)

        let currentObject = result

        // Create nested object
        while (finalKeys.length > 1) {
            const firstKey = finalKeys.shift()

            if (!currentObject[firstKey]) {
                currentObject[firstKey] = {}
            }

            currentObject = currentObject[firstKey]
        }

        currentObject[finalKeys[0]] = values[key]
    }

    return result
}

/**
 * Flatten an object by combining keys with the delimitter constant.
 * 
 * @param {Object} input
 * @returns {Object} Flattened object
 */
export function flattenObject(input) {
    const result = {}

    function _flatten(input, keyCarry = "") {
        for (let key in input) {
            const backtraceKey = keyCarry + key

            if (input[key].constructor.name === "Object") {
                _flatten(input[key], backtraceKey + KEY_DELIMITER)
            } else {
                result[backtraceKey] = input[key]
            }
        }
    }

    _flatten(input)

    return result
}

/**
 * Attach the listeners to the event target and return a function which removes them.
 * 
 * @param {EventTarget|Emittable} target 
 * @param {Array<[String, Function]>} events 
 */
export function createListeners(target, events) {
    events.forEach(([name, fn]) => {
        target.addEventListener(name, fn, false)
    })

    return () => events.forEach(([name, fn]) => {
        target.removeEventListener(name, fn, false)
    })
}