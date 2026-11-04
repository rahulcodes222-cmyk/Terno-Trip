# Simple multi-stage build for booking service
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./
COPY package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY services/shared-events/package.json ./services/shared-events/
COPY services/booking-service/package.json ./services/booking-service/

# Create workspace config if needed
RUN cat package.json | grep -q workspaces || echo '{"workspaces": ["packages/*", "services/*"]}' > package.json

# Install dependencies
RUN npm ci --ignore-scripts

# Copy source code
COPY packages/shared ./packages/shared
COPY services/shared-events ./services/shared-events
COPY services/booking-service ./services/booking-service
COPY tsconfig.json ./

# Build
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=services/shared-events
RUN npm run build --workspace=services/booking-service

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built artifacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/services/shared-events ./services/shared-events
COPY --from=builder /app/services/booking-service/dist ./services/booking-service/dist

EXPOSE 4004
CMD ["node", "services/booking-service/dist/index.js"]