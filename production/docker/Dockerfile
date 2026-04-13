# Cash Box App Manager REST API
FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY bin ./bin
COPY src ./src

ENV NODE_ENV=production
EXPOSE 3633

CMD ["node", "bin/server.js"]
