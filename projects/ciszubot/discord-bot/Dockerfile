# ── Stage 1: build (TypeScript) ──
# Contexto de build: raíz del monorepo (necesita pnpm-workspace.yaml + pnpm-lock.yaml)
FROM node:24-alpine AS builder

RUN corepack enable; corepack prepare pnpm@11.18.0 --activate

WORKDIR /repo

COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY projects/ciszubot/discord-bot/package.json ./projects/ciszubot/discord-bot/package.json
COPY packages/utils/package.json ./packages/utils/package.json
RUN pnpm install --frozen-lockfile --filter ciszubot

COPY projects/ciszubot/discord-bot/tsconfig.json ./projects/ciszubot/discord-bot/tsconfig.json
COPY projects/ciszubot/discord-bot/src ./projects/ciszubot/discord-bot/src
COPY packages/utils/index.ts ./packages/utils/index.ts
COPY packages/utils/src ./packages/utils/src
RUN pnpm --filter ciszubot build

# ── Stage 2: runtime (solo producción, mínimo) ──
FROM node:24-alpine

RUN corepack enable; corepack prepare pnpm@11.18.0 --activate
RUN apk add --no-cache ffmpeg python3 make g++

WORKDIR /repo

ENV NODE_ENV=production

COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY projects/ciszubot/discord-bot/package.json ./projects/ciszubot/discord-bot/package.json
COPY packages/utils/package.json ./packages/utils/package.json
RUN pnpm install --frozen-lockfile --filter ciszubot --prod

COPY --from=builder /repo/projects/ciszubot/discord-bot/dist ./projects/ciszubot/discord-bot/dist
COPY projects/ciszubot/discord-bot/bot-config.json ./projects/ciszubot/discord-bot/bot-config.json
COPY projects/ciszubot/discord-bot/public ./projects/ciszubot/discord-bot/public

WORKDIR /repo/projects/ciszubot/discord-bot

RUN mkdir -p logs && chown -R node:node logs

# El bot NO corre como root
USER node

EXPOSE 5000

CMD ["node", "dist/src/index.js"]
