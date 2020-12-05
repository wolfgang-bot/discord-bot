import React from "react"
import { useParams, Redirect } from "react-router-dom"
import { CircularProgress } from "@material-ui/core"

import Layout from "../components/Layout/Layout.js"
import ConfigForm from "../components/Forms/ConfigForm.js"
import useAPIData from "../utils/useAPIData.js"

function ConfigPage() {
    const { guildId } = useParams()

    const { isLoading, data, error } = useAPIData({
        method: "getConfigDescriptive",
        data: guildId
    })

    if (isLoading) {
        return <Layout><CircularProgress/></Layout>
    }

    if (error?.response.status === 403) {
        return <Redirect to="/"/>
    }

    return (
        <Layout>
            <ConfigForm guildId={guildId} data={data} onUpdate={() => console.log("Update")}/>
        </Layout>
    )
}

export default ConfigPage