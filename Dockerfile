# syntax=docker/dockerfile:1.4
FROM node:20.18-alpine AS base
WORKDIR /app
RUN apk add --no-cache \
    python3 \
    make \
    g++ && \
    npm install -g pnpm && \
    ln -sf /usr/bin/python3 /usr/bin/python

FROM base AS prod-deps
COPY package.json ./
# Force update of the lockfile
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --force

FROM base AS builder
COPY package.json ./
# Force update of the lockfile
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --force
COPY . .
RUN pnpm run build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=builder /app/.medusa ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/medusa-config.ts ./
WORKDIR /app/server
VOLUME ["/app/uploads", "/app/static"]
EXPOSE 9000
CMD ["sh", "-c", "pnpm medusa migrations run && pnpm start:prod"]
