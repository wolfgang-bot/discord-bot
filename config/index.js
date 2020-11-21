module.exports = {
    userRole: "Benutzer",

    colors: {
        primary: "#3f51b5"
    },

    dynamicVoicechannels: {
        defaultChannels: 3,
        channelName: "🔊┃voice {}"
    },

    questionChannels: {
        channelName: "❓┃{}",
        resolveReaction: "✅",
        deleteReaction: "❌",
        acceptReputation: 10,
        messageReputation: 1,
        messageReputationTimeout: 7500,
        askChannelRateLimit: 60 * 5 // 5 minutes
    },

    reputationSystem: {
        roles: ["Bronze", "Silber", "Gold", "Platin", "Diamant"],
        roleColors: ["ORANGE", "#ffffff", "GOLD", "#607d8b", "BLUE"],
        roleThresholds: [10, 100, 500, 1000, 2500], // n[i] < n[i+1]; |roleThresholds| = |roles|,
        levelUpReactionEmoji: "💯"
    },

    skillRoles: {
        emojiPrefix: "skill_",
        roleColor: "AQUA",
        roles: [
            "Javascript",
            "HTML",
            "CSS",
            "Python",
            "React",
            "Vue",
            "Angular",
            "Linux",
            "Java",
            "Cpp"
        ]
    }
}