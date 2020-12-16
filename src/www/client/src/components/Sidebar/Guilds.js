import React from "react"
import { CircularProgress } from "@material-ui/core"

import useAPIData from "../../utils/useAPIData.js"
import Guild from "./Guild.js"

function Guilds() {
    const { isLoading, data } = useAPIData("getGuilds")

    if (isLoading) {
        return <CircularProgress/>
    }

    return data.map(guild => (
        <Guild guild={guild} key={guild.id} />
    ))
}

export default Guilds