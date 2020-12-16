import React from "react"

import Layout from "../components/Layout/Layout.js"
import notFoundAnimation from "../assets/images/not-found.webp"

function NotFoundPage() {
    return (
        <Layout center>
            <img src={notFoundAnimation} alt="Funny Vincent Vega GIF ;)"/>
        </Layout>
    )
}

export default NotFoundPage