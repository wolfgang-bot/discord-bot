import React from "react"
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom"

import ProtectedRoute from "./ProtectedRoute.js"
import IndexPage from "../pages/IndexPage.js"
import LoginPage from "../pages/LoginPage.js"
import GuildPage from "../pages/GuildPage.js"
import NotFoundPage from "../pages/NotFoundPage.js"

function Router() {
    return (
        <BrowserRouter>
            <Switch>
                <ProtectedRoute path="/guild/:id">
                    <GuildPage/>
                </ProtectedRoute>

                <Route path="/login">
                    <LoginPage/>
                </Route>

                <Route exact path="/">
                    <IndexPage/>
                </Route>

                <Route path="/not-found">
                    <NotFoundPage/>
                </Route>

                <Route>
                    <Redirect to="/not-found"/>
                </Route>
            </Switch>
        </BrowserRouter>
    )
}

export default Router