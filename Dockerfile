FROM node:14-slim

ENV PORT=8080
ENV FRONTEND_HOST=frontend
ENV FRONTEND_PORT=3000
ENV SQLITE_DB_PATH=/etc/storage/db.sqlite3

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "src/index.js"]
