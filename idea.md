* Modules
    * Fragen: Frage im definierten Kanal stellen -> Textchat für die Frage wird erstellt
        * Reaktion auf eine Antwort
            * Verfasser bekommt Reputation
            * Kanal wird gelöscht
        * Für jede Nachricht in einem Fragechannel
            * Der Verfasser bekommt 1 Reputation, sofern er die Frage nicht verfasst hat
            * Timeout
        * Fragestellen Kanal
            * Slow mode
            
    * Voicechat: Drei standard Voicechats -> Wenn alle belegt sind (min. 1 Benutzer), erstelle einen weiteren Voicechat -> Entferne ihn wieder, wenn einer der drei Voicechats frei ist, sofern er frei ist.

* Hinzugefügte Events (name: [arg] [...])
    * reputationAdd: member: Discord.GuildMember, amount: Number

* Commands
    * sweep <n>
        * Entferne die letzten n Nachrichten aus dem Kanal