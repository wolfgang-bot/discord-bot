FROM node:14-slim

ENV PORT=8080
ENV FRONTEND_HOST=frontend
ENV FRONTEND_PORT=3000

WORKDIR /app

RUN apt update -y
RUN apt install fontconfig -y

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build
RUN npm run install-fonts

ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "src/index.js"]
