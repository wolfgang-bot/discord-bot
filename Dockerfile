FROM node:14-alpine

RUN apk add --no-cache git

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["node", "src/index.js"]
