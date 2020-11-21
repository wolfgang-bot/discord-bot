module.exports = {
    userRole: "Benutzer",

    colors: {
        primary: "#3f51b5"
    },

    dynamicVoicechannels: {
        defaultChannels: 3,
        channelName: "Voice {}"
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
        roles: ["Anfänger", "Fortgeschrittener", "Experte", "Profi", "Gott"],
        roleArticles: ["ein", "ein", "ein", "ein", "ein"],
        initialRoleColor: [2/3, 1, 0], // HSL
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