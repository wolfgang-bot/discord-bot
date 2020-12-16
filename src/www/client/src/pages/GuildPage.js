import React from "react"
import { useParams } from "react-router-dom"
import { CircularProgress, makeStyles } from "@material-ui/core"

import Layout from "../components/Layout/Layout.js"
import useAPIData from "../utils/useAPIData.js"

const useStyles = makeStyles(theme => ({
}))

function GuildPage() {
    const { id } = useParams()

    const { isLoading, data } = useAPIData({
        method: "getGuild",
        data: id
    })

    if (isLoading) {
        return <CircularProgress/>
    }

    console.log(data)

    return (
        <Layout>
        </Layout>
    )
}

export default GuildPage