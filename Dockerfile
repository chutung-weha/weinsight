# ── Stage 1: Dependencies ──
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
# Prisma generate needs schema
COPY prisma ./prisma
RUN npx prisma generate

# ── Stage 2: Build ──
FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma

# Chỉ các biến BUILD-TIME (public hoặc cần cho Prisma generate) được truyền qua ARG.
# NEXTAUTH_SECRET, GOOGLE_CLIENT_SECRET, GROQ_API_KEY là secret RUNTIME
# → bơm qua docker run --env-file hoặc docker compose env, KHÔNG bake vào image.
ARG DATABASE_URL
ARG DIRECT_URL
ARG NEXTAUTH_URL
ENV DATABASE_URL=$DATABASE_URL
ENV DIRECT_URL=$DIRECT_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL
# Next.js build có thể cần NEXTAUTH_SECRET để render route protected.
# Nếu cần, pass qua --build-arg nhưng chấp nhận rằng nó sẽ có trong layer.
# Hoặc dùng placeholder + rely on runtime env (khuyên dùng cách này).
ENV NEXTAUTH_SECRET="build-time-placeholder-replace-at-runtime"
RUN npm run build

# ── Stage 3: Production ──
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Non-root user
RUN addgroup --system nodejs && adduser --system --ingroup nodejs nextjs

# Standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Prisma schema + engine (cho migrate deploy trong container)
COPY --from=builder /app/prisma ./prisma
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps /app/node_modules/@prisma ./node_modules/@prisma

# Fix cache directory permissions (Next.js cần ghi vào .next/cache runtime)
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"

CMD ["node", "server.js"]
