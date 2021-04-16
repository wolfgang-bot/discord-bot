FROM node:14-slim

ARG DISCORD_BOT_TOKEN
ARG DISCORD_API_CLIENT_ID
ARG DISCORD_API_CLIENT_SECRET
ARG JWT_SECRET
ARG ADMIN_USER_IDS

ENV HOST=localhost
ENV PORT=8080
ENV PROTOCOL=http
ENV PUBLIC_PORT=80
ENV FRONTEND_HOST=frontend
ENV FRONTEND_PORT=3000

ENV SQLITE_DB_PATH=/etc/storage/db.sqlite3

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

# Somehow building with NODE_ENV=production throws an error ¯\_(ツ)_/¯ (That's why it's down here)
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "src/index.js"]
