import React, { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { CircularProgress } from "@material-ui/core"

import Guild from "./Guild.js"
import WebSocketAPI from "../../api/websocket/WebSocketAPI.js"


function Guilds({ activeGuild }) {
    const dispatch = useDispatch()

    const guilds = useSelector(store => store.api.guilds)
    
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        dispatch(fetch)
            .then(() => setIsLoading(false))
    }, [])

    if (isLoading) {
        return <CircularProgress/>
    }

    return <div></div>

    return WebSocketAPI.guilds.map(guild => (
        <Guild guild={guild} key={guild.id} active={activeGuild && activeGuild === guild.id}/>
    ))
}

export default Guilds