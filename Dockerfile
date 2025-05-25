# Use the official Node.js 20 image as the base
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN apk add --no-cache \
    build-base \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    python3 \
    pkgconfig \
    glib-dev \
    freetype-dev \
    libpng-dev \
    && npm install -g node-gyp pnpm \
    && rm -rf node_modules/canvas \
    && pnpm install canvas --ignore-scripts \
    && cd node_modules/canvas && node-gyp rebuild && cd ../.. \
    && pnpm run build

# Production image, copy all necessary files and run next start
FROM base AS runner
ENV NODE_ENV=production

# Install pnpm in production stage
RUN npm install -g pnpm

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

WORKDIR /app

# Copy built assets and node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/postcss.config.mjs ./postcss.config.mjs
COPY --from=builder /app/eslint.config.mjs ./eslint.config.mjs
COPY --from=builder /app/tsconfig.json ./tsconfig.json

USER nextjs

EXPOSE 3000

CMD ["node", ".next/standalone/server.js"]
