FROM node:14-slim

ENV PORT=8080
ENV FRONTEND_HOST=frontend
ENV FRONTEND_PORT=3000

ENV SQLITE_DB_PATH=/etc/storage/db.sqlite3

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Somehow building with NODE_ENV=production throws an error ¯\_(ツ)_/¯ (That's why it's down here)
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "src/index.js"]
