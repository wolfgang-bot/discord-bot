import axios from "axios"

// import format, {
//     TYPE
// } from "./formatAPI.js"
import { API_BASE_URL } from "./constants.js"

export function setTokenHeader(token) {
    axios.defaults.headers.common = {
        "Authorization": "Baerer " + token
    }
}

function url(path) {
    return API_BASE_URL + path
}

export const getConfig = (id) => axios.get(url("/config/" + id))
export const getConfigDescriptive = (id) => axios.get(url("/config/descriptive/" + id))
export const setConfig = (id, data) => axios.post(url("/config/" + id), data)