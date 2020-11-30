const BLANK = "\u200B"

/**
 * Make a Markdown Codeblock
 * 
 * @param {String} str
 * @returns {String} The string inserted into a markdown codeblock
 */
function makeCodeblock(str) {
    return "```\n" + str + "```"
}

/**
 * Parse an argument string into an array and accept quoted string to
 * containe whitespace. e.g.
 * > 'arg1 "arg 2" arg3'
 * will be parsed to
 * > ["arg1", "arg 2", "arg3"]
 * It works like a DEA
 *  
 * @param {String} content 
 * @returns {Array<String>} Parsed arguments
 */
function parseArguments(content) {
    // Sanitize input
    content = content
        .replace(process.env.DISCORD_BOT_PREFIX, "")
        .trim()
        .replace(/\s+/g, " ")

    const args = []

    let currentArg = ""
    let stack = []

    for (let char of content) {
        let top = stack.pop()

        if (top === '"') { // Input is quoted
            if (char === '"') { // Quotes are closed
                args.push(currentArg)
                currentArg = ""
            } else {
                currentArg += char
                stack.push(top)
            }
        } else {
            if (currentArg.length === 0 && char === '"') { // Quote starts at beginning of argument
                stack.push(char)
            } else if (char === " ") {
                if (currentArg.length > 0) {
                    args.push(currentArg)
                    currentArg = ""
                }
            } else {
                currentArg += char
            }
        }
    }

    if (currentArg.length > 0) {
        args.push(currentArg)
    }

    return args
}

/**
 * Get the corresponding level to a amount of reputation
 * 
 * @param {Object} config
 * @param {Number} reputation
 * @returns {Number} Level for the amount of reputation
 */
function getLevel(config, reputation) {
    let level = -1

    for (let threshold of config["reputation-system"].roleThresholds) {
        if (reputation >= threshold) {
            level++
        } else {
            return level
        }
    }

    return level
}

/**
 * Generates an empty string which has a given length
 * 
 * @param {Number} length 
 * @returns {String} As many blanks as requested
 */
function space(length) {
    return (BLANK + " ").repeat(length)
}

/**
 * Formats an object of the form
 * {
 *     "description": String,
 *     "value": Any
 * }
 * recursively into an object which only contains the values
 * 
 * @param {Object} object 
 * @returns {Object} Formatted object
 */
function formatDescriptiveObject(object) {
    const formatted = {}

    for (let key in object) {
        if (typeof object[key].value === "object" && !Array.isArray(object[key].value)) {
            formatted[key] = formatDescriptiveObject(object[key].value)
        } else {
            formatted[key] = object[key].value
        }
    }

    return formatted
}

/**
 * Inserts the values of the source object into the values of
 * the dest object, where the dest object is descriptive.
 * A descriptive object has the format:
 * {
 *     "description": String,
 *     "value": Any
 * }
 * 
 * @param {Object} source 
 * @param {Object} dest 
 * @returns {Object} Dest object with the values from source
 */
function insertIntoDescriptiveObject(source, dest) {
    const result = {}

    for (let key in source) {
        result[key] = dest[key]

        if (source[key].constructor.name === "Object") {
            result[key].value = insertIntoDescriptiveObject(source[key], result[key].value)
        } else {
            result[key].value = source[key]
        }
    }

    return result
}

/**
 * Check recursively if a key exists in an object
 * 
 * @param {Object} object
 * @param {String} key
 * @returns {Boolean} Whether the key exists in the object
 */
function existsInObject(object, key) {
    for (let _key in object) {
        if (_key === key) {
            return true
        }

        if (typeof object[_key] === "object" && existsInObject(object[_key], key)) {
            return true
        }
    }

    return false
}

/**
 * Convert a string to the requested data-type
 * Supported data-types: String, Number, Array
 * 
 * @param {String} input
 * @param {String} datatype
 * @returns {Any} The input formatted to match the data-type of the target
 */
function convertDatatype(input, datatype) {
    // Convert to string
    if (datatype === "String") {
        return input
    }

    // Convert to number
    if (datatype === "Number") {
        const number = parseFloat(input)

        if (isNaN(number)) {
            throw "Ungültiger Zahlenwert"
        }

        return number
    }

    // Convert to array
    if (datatype === "Array") {
        return input.split(" ")
    }
}

/**
 * Check recursively if two objects have the same keys and every value is
 * of the same data-type.
 * 
 * @param {Object} object1
 * @param {Object} object2
 * @returns {Boolean} Whether the two objects have an identical structure.
 */
function compareStructure(object1, object2) {
    // Collect keys from both objects
    const keys = new Set(Object.keys(object1).concat(Object.keys(object2)))

    for (let key of keys) {
        // Verify existance
        if (!(key in object1) || !(key in object2)) {
            return false
        }

        // Verify data-type
        if (object1[key].constructor.name !== object2[key].constructor.name) {
            return false
        }

        // Verify recursively if the sub-objects have the same structure
        if (object1[key].constructor.name === "Object" && !compareStructure(object1[key], object2[key])) {
            return false
        }
    }

    return true
}

/**
 * Run constraint methods of a descriptive object
 * 
 * @param {Object} source
 * @param {Object} dest Descriptive Object
 * @returns {Object} An object with the same structure as the source object and the errors as values
 */
function verifyConstraints(source, dest) {
    const errors = {}
    let hasErrors = false

    function verify(source, dest, errors) {
        for (let key in source) {
            const value = source[key]
            const descriptor = dest[key]

            // Run the "verifyContraints" method
            if (descriptor.verifyConstraints && !descriptor.verifyConstraints(value, source)) {
                errors[key] = descriptor.constraints
                hasErrors = true
            }

            // Recursively verify sub-objects
            if (value.constructor.name === "Object") {
                errors[key] = {}
                verify(value, descriptor.value, errors[key])
            }
        }
    }

    verify(source, dest, errors)

    if (hasErrors) {
        return errors
    }
}

module.exports = {
    makeCodeblock,
    parseArguments,
    getLevel,
    space,
    formatDescriptiveObject,
    insertIntoDescriptiveObject,
    existsInObject,
    convertDatatype,
    compareStructure,
    verifyConstraints
}