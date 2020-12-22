import { useState, useEffect } from "react"

import WebSocketAPI from "../api/websocket/WebSocketAPI.js"

/**
 * Fetch data from a web socket event
 * 
 * @param {String} methodName 
 * @param  {...Any} args 
 * 
 * @returns {Object} response - A custom response object
 * @returns {Boolean} response.isLoading - Whether or not the request is pending
 * @returns {Any} response.data - The response's data
 * @returns {String} response.error - The error, if one occured
 */
function useWSAPIData(methodName, ...args) {
    const method = WebSocketAPI[methodName]?.bind(WebSocketAPI)

    if (!method) {
        throw new Error(`Unknown API method '${methodName}'`)
    }

    const [isLoading, setIsLoading] = useState(true)
    const [data, setData] = useState()
    const [error, setError] = useState()

    useEffect(() => {
        method(...args)
            .then((res) => {
                setError(null)
                setData(res.data)
            })
            .catch((res) => {
                setError(res.error)
                setData(null)
            })
            .finally(() => setIsLoading(false))
    }, [])

    return { isLoading, data, error }
}

export default useWSAPIData