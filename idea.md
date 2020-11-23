* Modules
    * Fragen: Frage im definierten Kanal stellen
        * Textchat für die Frage wird erstellt (Kanalbeschreibung = Überschrift der Frage)
        * Höchstens eine aktive Frage pro Benutzer
        * Abbruchreaktion -> Kanal löschen
        * Reaktion auf eine Antwort
            * Verfasser bekommt Reputation
            * Kanal wird gelöscht
        * Für jede Nachricht in einem Fragechannel
            * Der Verfasser bekommt 1 Reputation, sofern er die Frage nicht verfasst hat
            * Timeout
        * Fragestellen Kanal
            * Slow mode
            
    * Voicechat: Drei standard Voicechats -> Wenn alle belegt sind (min. 1 Benutzer), erstelle einen weiteren Voicechat -> Entferne ihn wieder, wenn einer der drei Voicechats frei ist, sofern er frei ist.

    * Verification: Benutzer bekommt nach dem joinen die "Unverifiziert" -> Regeln akzeptieren -> "User" Rolle
        * "Unverifiziert" Rolle: Kann keine Nachrichten senden / Keinem Voicechannel beitreten

    * Skill-Rollen:
        * Zuweisung über Reaktionen
        * Hinweis in Fragenachricht, dass bis zu zwei Skill Rollen getagged werden können.

* Hinzugefügte Events (name: [arg] [...])
    * reputationAdd: member: Discord.GuildMember, amount: Number

* Commands
    * sweep <n>
        * Entferne die letzten n Nachrichten aus dem Kanal

* TODO:
    * Counting Spiel (🔢┃counting)
    * Command: Modul Konfigurationen ausgeben
    * Bot-Konfiguration Guildenabhängig machen