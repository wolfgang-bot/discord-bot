import { createStore, applyMiddleware, compose } from "redux"
import thunk from "redux-thunk"

import rootReducer from "./reducers/root.js"

const store = createStore(
    rootReducer,
    compose(applyMiddleware(thunk), window.__REDUX_DEVTOOLS_EXTENSION__?.())
)

export default store