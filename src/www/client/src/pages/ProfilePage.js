import React from "react"
import { useSelector } from "react-redux"
import { Redirect } from "react-router-dom"

import Layout from "../components/Layout/Layout.js"
import Guilds from "../components/User/Guilds.js"

function ProfilePage() {
    const isLoggedIn = useSelector(store => store.auth.isLoggedIn)

    if (!isLoggedIn) {
        return <Redirect to="/login"/>
    }

    return (
        <Layout center>
            <Guilds/>
        </Layout>
    )
}

export default ProfilePage