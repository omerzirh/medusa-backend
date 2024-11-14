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

WORKDIR /app

# Install production dependencies
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Build the application
FROM base AS builder
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Final stage
FROM base

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/.medusa /app/.medusa
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/medusa-config.ts ./

# Create and set proper permissions for volumes
RUN mkdir -p /app/uploads /app/static && \
    chown -R node:node /app/uploads /app/static

# Use non-root user
USER node

VOLUME ["/app/uploads", "/app/static"]
EXPOSE 9000

CMD ["pnpm", "start:prod"]