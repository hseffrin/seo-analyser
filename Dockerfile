# Stage 1: Base - Setup environments
FROM node:20-alpine AS base
RUN npm install -g pnpm

# Stage 2: Dependencies - Install node modules
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 3: Development - For local dev and debugging
FROM deps AS development
WORKDIR /app
COPY . .
# We don't mount volumes, but we still use pnpm dev for live reloading within the container
CMD ["pnpm", "dev"]

# Stage 4: Builder - Build the production standalone output
FROM deps AS builder
WORKDIR /app
COPY . .
RUN pnpm build

# Stage 5: Production Runner - Minimal image for production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
