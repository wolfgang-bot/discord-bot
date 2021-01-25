const HTTPStatusCodes: {
    [code: number]: string
} = {
    400: "Bad Request",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error"
}

/**
 * Generate success object
 */
export function success(data?: any) {
    return {
        status: "ok",
        data
    }
}

/**
 * Generate error object
 */
export function error(status: number | string, message?: any) {
    if (typeof status === "number") {
        if (!message) {
            message = HTTPStatusCodes[status]
        }

        status = "error"
    }

    return { status, message }
}