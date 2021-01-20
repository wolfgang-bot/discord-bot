import { combineReducers } from "redux"

import auth from "./auth.js"
import api from "./api.js"

const rootReducer = combineReducers({
    auth,
    api
})

export default rootReducer