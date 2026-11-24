FROM node:lts AS builder

WORKDIR /app

COPY package.json yarn.lock ./
COPY prisma ./prisma/

RUN yarn install

COPY . .

RUN yarn build

FROM node:lts

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl gpg lsb-release \
  && mkdir -p /usr/share/keyrings \
  && curl -fsSL https://packages.redis.io/gpg | gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg \
  && echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" > /etc/apt/sources.list.d/redis.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends redis \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir -p /tmp/redis \
  && chown -R node:node /tmp/redis

COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/package.json ./
COPY --chown=node:node --from=builder /app/yarn.lock ./
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma
COPY --chown=node:node --chmod=755 --from=builder /app/start_prod.sh ./start_prod.sh

USER node

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD ["node", "-e", "const net = require('net'); const socket = net.connect(Number(process.env.PORT || 4000), '127.0.0.1'); socket.on('connect', () => { socket.end(); process.exit(0); }); socket.on('error', () => process.exit(1));"]

CMD ["./start_prod.sh"]
