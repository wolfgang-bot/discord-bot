import React from "react"
import { BrowserRouter, Switch, Route } from "react-router-dom"

import ProtectedRoute from "./ProtectedRoute.js"
import IndexPage from "../pages/IndexPage.js"
import ConfigPage from "../pages/ConfigPage.js"
import LoginPage from "../pages/LoginPage.js"

function Router() {
    return (
        <BrowserRouter>
            <Switch>
                <ProtectedRoute path="/config/:guildId">
                    <ConfigPage/>
                </ProtectedRoute>

                <Route path="/login">
                    <LoginPage/>
                </Route>

                <Route exact path="/">
                    <IndexPage/>
                </Route>

                <Route>
                    <div>404</div>
                </Route>
            </Switch>
        </BrowserRouter>
    )
}

export default Router