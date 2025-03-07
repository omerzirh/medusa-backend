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
COPY package.json pnpm-lock.yaml ./
# Allow regeneration of the lockfile
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --no-frozen-lockfile

FROM base AS builder
COPY package.json pnpm-lock.yaml ./
# Allow regeneration of the lockfile
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --no-frozen-lockfile
COPY . .
# Create a custom build script that handles the nested pnpm install
RUN echo '#!/bin/sh\npnpm run build:server && pnpm run build:admin && cd .medusa/server && pnpm install --no-frozen-lockfile' > custom-build.sh && \
    chmod +x custom-build.sh && \
    ./custom-build.sh

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=builder /app/.medusa ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/medusa-config.ts ./
WORKDIR /app/server
VOLUME ["/app/uploads", "/app/static"]
EXPOSE 9000
CMD ["pnpm", "start:prod"]
