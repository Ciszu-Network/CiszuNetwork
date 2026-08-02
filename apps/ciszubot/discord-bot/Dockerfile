# ── Stage 1: build (TypeScript) ──
# Contexto de build: raíz del monorepo (necesita pnpm-workspace.yaml + pnpm-lock.yaml)
FROM node:24-alpine AS builder

RUN corepack enable; corepack prepare pnpm@11.18.0 --activate

WORKDIR /repo

COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/ciszubot/discord-bot/package.json ./apps/ciszubot/discord-bot/package.json
RUN pnpm install --frozen-lockfile --filter ciszubot

COPY apps/ciszubot/discord-bot/tsconfig.json ./apps/ciszubot/discord-bot/tsconfig.json
COPY apps/ciszubot/discord-bot/src ./apps/ciszubot/discord-bot/src
RUN pnpm --filter ciszubot build

# ── Stage 2: runtime (solo producción, mínimo) ──
FROM node:24-alpine

RUN corepack enable; corepack prepare pnpm@11.18.0 --activate

WORKDIR /repo

ENV NODE_ENV=production

COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/ciszubot/discord-bot/package.json ./apps/ciszubot/discord-bot/package.json
RUN pnpm install --frozen-lockfile --filter ciszubot --prod

COPY --from=builder /repo/apps/ciszubot/discord-bot/dist ./apps/ciszubot/discord-bot/dist
COPY apps/ciszubot/discord-bot/bot-config.json ./apps/ciszubot/discord-bot/bot-config.json
COPY apps/ciszubot/discord-bot/public ./apps/ciszubot/discord-bot/public

WORKDIR /repo/apps/ciszubot/discord-bot

RUN mkdir -p logs && chown -R node:node logs

# El bot NO corre como root
USER node

EXPOSE 5000

CMD ["node", "dist/index.js"]
