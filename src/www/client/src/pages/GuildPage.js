import React, { useEffect } from "react"
import { useParams } from "react-router-dom"
import { CircularProgress, Typography } from "@material-ui/core"

import Layout from "../components/Layout/Layout.js"
import useAPIData from "../utils/useAPIData.js"
import ConfigForm from "../components/Forms/ConfigForm/ConfigForm.js"

function GuildPage() {
    const { id } = useParams()

    const { isLoading, data, reload } = useAPIData({
        method: "getGuild",
        data: id,
        initialRequest: false
    })

    useEffect(reload, [id])

    return (
        <Layout>
            { isLoading ? <CircularProgress /> : (
                <>
                    <Typography variant="h5" gutterBottom>{ data?.name }</Typography>

                    <ConfigForm guildId={id} />
                </>
            )}
        </Layout>
    )
}

export default GuildPage