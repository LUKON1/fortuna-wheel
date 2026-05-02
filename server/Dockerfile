FROM node:25.9-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . ./

USER node

EXPOSE 3000

CMD ["node", "index.js"]
