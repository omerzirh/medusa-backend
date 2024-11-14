# syntax=docker/dockerfile:1.4
FROM node:20.18-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apk add --no-cache \
    python3 \
    make \
    g++ && \
    corepack enable && \
    ln -sf /usr/bin/python3 /usr/bin/python

WORKDIR /app/server

# Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Build the application
FROM deps AS builder
COPY . .
COPY tsconfig.json .
COPY medusa-config.ts .
RUN pnpm build

# Production image
FROM base AS runner

COPY --from=deps /app/server/node_modules ./node_modules
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/package.json .
COPY --from=builder /app/server/medusa-config.js ./dist/
COPY --from=builder /app/server/.medusa ./.medusa

# Create required directories and set permissions
RUN mkdir -p uploads static && \
    chown -R node:node .

USER node

EXPOSE 9000

CMD ["pnpm", "start:prod"]