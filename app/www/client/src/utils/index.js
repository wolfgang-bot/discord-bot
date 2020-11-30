import React from "react"

/**
 * Make an array of component which render a descriptive object recursively.
 * 
 * @param {Object} data Descriptive object
 * @param {Object} components Rendered components
 * @param {Function} components.title Sub-Object's Key
 * @param {Function} components.container Container for sub-object's values
 * @param {Function} components.leaf Value where no further recursion happens
 * @returns {Array<React.Elements>}
 */
export function createNestedElements(data, components) {
    function _create(data, keyCarry = "", depth = 0) {
        const elements = []

        for (let key in data) {
            const value = data[key].value
            const desc = data[key].description

            if (value.constructor.name === "Object") {
                elements.push(React.createElement(components.title, {
                    key: keyCarry + key + "title",
                    _key: key,
                    desc,
                    depth
                }))

                // Recursively create elements with depth += 1
                elements.push(React.createElement(components.container, {
                    key: keyCarry + key + "container",
                    children: _create(value, keyCarry + key, depth + 1)
                }))
            } else {
                elements.push(React.createElement(components.leaf, {
                    key: keyCarry + key + "leaf",
                    _key: key,
                    value,
                    desc,
                    depth
                }))
            }
        }

        return elements
    }

    return _create(data)
}