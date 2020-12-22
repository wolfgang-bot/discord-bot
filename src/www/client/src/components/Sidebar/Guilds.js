import React from "react"
import { CircularProgress } from "@material-ui/core"

import Guild from "./Guild.js"
import useWSAPIData from "../../utils/useWSAPIData.js"

function Guilds({ activeGuild }) {
    const { isLoading, data } = useWSAPIData("getGuilds")

    if (isLoading) {
        return <CircularProgress/>
    }

    return data.map(guild => (
        <Guild guild={guild} key={guild.id} active={activeGuild && activeGuild === guild.id}/>
    ))
}

export default Guilds