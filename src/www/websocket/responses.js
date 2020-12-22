/**
 * Generate success object
 * 
 * @param {Any} [object]
 */
function success(data) {
    return {
        status: "ok",
        data
    }
}

/**
 * Generate error object
 * 
 * @param {String|Number} status
 * @param {String} [message]
 */
function error(status, message) {
    if (typeof status === "number") {
        if (!message) {
            if (status === 400) {
                message = "Bad Request"
            } else if (status === 403) {
                message = "Forbidden"
            } else if (status === 404) {
                message = "Not found"
            } else if (status === 500) {
                message = "Internal Server Error"
            }
        }

        status = "error"
    }

    return { status, message }
}

module.exports = { success, error }