import React from "react"
import { useSelector } from "react-redux"
import { Redirect, useLocation, Route } from "react-router-dom"

function ProtectedRoute({ children, ...props }) {
    const location = useLocation()

    const isLoggedIn = useSelector(store => store.auth.isLoggedIn)

    if (!isLoggedIn) {
        return <Redirect to={`/login?redirect_to=${encodeURIComponent(location.pathname)}`}/>
    }

    return (
        <Route {...props}>
            { children }
        </Route>
    )
}

export default ProtectedRoute