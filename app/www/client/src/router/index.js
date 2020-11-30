import React from "react"
import { BrowserRouter, Switch, Route } from "react-router-dom"

import IndexPage from "../pages/IndexPage.js"
import ConfigPage from "../pages/ConfigPage.js"

function Router() {
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/config/:guildId">
                    <ConfigPage/>
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