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
        result[key].value = source[key]
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

module.exports = { makeCodeblock, parseArguments, getLevel, space, formatDescriptiveObject, insertIntoDescriptiveObject, existsInObject, convertDatatype }