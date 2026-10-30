# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace manifests
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY services/shared-events/package*.json ./services/shared-events/
COPY services/auth-service/package*.json ./services/auth-service/

# Install all workspace deps
RUN npm ci --ignore-scripts

# Copy source
COPY packages/shared/ ./packages/shared/
COPY services/shared-events/ ./services/shared-events/
COPY services/auth-service/ ./services/auth-service/
COPY tsconfig.json ./

# Build shared packages first, then the service
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=services/shared-events
RUN npm run build --workspace=services/auth-service

# ── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/services/shared-events ./services/shared-events
COPY --from=builder /app/services/auth-service/dist ./services/auth-service/dist
COPY --from=builder /app/services/auth-service/package.json ./services/auth-service/package.json

EXPOSE 4001
CMD ["node", "services/auth-service/dist/index.js"]
