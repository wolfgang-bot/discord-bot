import React from "react"
import { useParams, Redirect } from "react-router-dom"
import { CircularProgress, Typography } from "@material-ui/core"
import { makeStyles } from "@material-ui/core"

import Layout from "../components/Layout/Layout.js"
import ConfigForm from "../components/Forms/ConfigForm.js"
import GuildIcon from "../components/Discord/GuildIcon.js"
import useAPIData from "../utils/useAPIData.js"

const useStyles = makeStyles(theme => ({
    guildNameWrapper: {
        marginBottom: theme.spacing(6),
        display: "flex",
        alignItems: "center"
    },

    guildName: {
        marginLeft: theme.spacing(2)
    }
}))

function GuildName({ id }) {
    const classes = useStyles()

    const { isLoading, data } = useAPIData({
        method: "getGuild",
        data: id
    })

    if (isLoading) {
        return <CircularProgress/>
    }

    return (
        <div className={classes.guildNameWrapper}>
            <GuildIcon guild={data}/>
            <Typography variant="h5" className={classes.guildName}>{data.name}</Typography>
        </div>
    )
}

function ConfigPage() {
    const { guildId } = useParams()

    const { isLoading, data, error, reload } = useAPIData({
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
            <GuildName id={guildId}/>

            <ConfigForm guildId={guildId} data={data} onUpdate={reload}/>
        </Layout>
    )
}

export default ConfigPage