const HTTPStatusCodes: Record<number, string> = {
    400: "Bad Request",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error"
}

/**
 * Generate success object
 */
export function success(data?: any): {
    status: "ok"
    data: any
} {
    return {
        status: "ok",
        data
    }
}

/**
 * Generate error object
 */
export function error(status: number | string, message?: any): {
    status: "error" | string
    message: string
} {
    if (typeof status === "number") {
        if (!message) {
            message = HTTPStatusCodes[status]
        }

        status = "error"
    }

    return { status, message }
}