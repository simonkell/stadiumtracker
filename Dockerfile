FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
COPY scripts/postinstall-prisma.mjs ./scripts/postinstall-prisma.mjs
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner-deps
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
COPY scripts/postinstall-prisma.mjs ./scripts/postinstall-prisma.mjs
RUN npm ci --omit=dev

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

COPY --from=builder /app ./
COPY --from=runner-deps /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
RUN apk upgrade --no-cache && apk add --no-cache sqlite
RUN mkdir -p /app/data

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push || npm run db:init; if [ ! -s /app/data/stadiumtracker.db ]; then npm run db:seed; fi; npm run start"]
