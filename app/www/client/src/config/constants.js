export const API_BASE_URL = window.location.origin + "/api"
export const DISCORD_OAUTH_API_ENDPOINT = API_BASE_URL + "/oauth/discord"
export const DISCORD_OAUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=772865751560093708&redirect_uri=${encodeURIComponent(DISCORD_OAUTH_API_ENDPOINT)}&response_type=code&scope=identify%20guilds`
export const DISCORD_CDN_BASE_URL = "https://cdn.discordapp.com"