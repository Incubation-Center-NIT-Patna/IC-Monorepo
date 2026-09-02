FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm turbo
WORKDIR /app
COPY . .
RUN turbo prune --scope=events-portal --docker

FROM node:22-alpine AS installer
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm@9.0.0 turbo
WORKDIR /app

# First install dependencies
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install

# Build the project
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm turbo run build --filter=events-portal

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Automatically leverage output traces to reduce image size
# The standalone output includes all necessary files including the apps/web prefix for turborepo
COPY --from=installer --chown=nextjs:nodejs /app/apps/events-portal/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/events-portal/.next/static ./apps/events-portal/.next/static
# Copy public folder if exists
COPY --from=installer --chown=nextjs:nodejs /app/apps/events-portal/public ./apps/events-portal/public

USER nextjs

EXPOSE 3002

ENV PORT 3002
ENV HOSTNAME "0.0.0.0"

CMD ["node", "apps/events-portal/server.js"]
