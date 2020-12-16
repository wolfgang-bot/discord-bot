import React, { useEffect } from "react"
import { useParams } from "react-router-dom"
import { CircularProgress, Typography, Grid, Divider } from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"

import Layout from "../components/Layout/Layout.js"
import useAPIData from "../utils/useAPIData.js"
import Modules from "../components/Modules/Modules.js"
import ConfigForm from "../components/Forms/ConfigForm/ConfigForm.js"
import GuildIcon from "../components/Discord/GuildIcon.js"

const useStyles = makeStyles(theme => ({
    spacing: {
        marginBottom: theme.spacing(4)
    }
}))

function GuildPage() {
    const classes = useStyles()
    
    const { id } = useParams()

    const { isLoading, data, reload, error } = useAPIData({
        method: "getGuild",
        data: id,
        initialRequest: false
    })

    useEffect(reload, [id])

    if (error) {
        throw error
    }

    return (
        <Layout
            sidebarProps={{
                activeGuild: id
            }}
        >
            { (isLoading || !data) ? <CircularProgress /> : (
                <>
                    <Grid container alignItems="center" spacing={4} className={classes.spacing}>
                        <Grid item>
                            <GuildIcon guild={data} />
                        </Grid>
                        <Grid>
                            <Typography variant="h5">{data.name}</Typography>
                        </Grid>
                    </Grid>

                    <div className={classes.spacing}>
                        <Modules guild={data}/>
                    </div>

                    <div className={classes.spacing}>
                        <ConfigForm guild={data} />
                    </div>
                </>
            )}
        </Layout>
    )
}

export default GuildPage