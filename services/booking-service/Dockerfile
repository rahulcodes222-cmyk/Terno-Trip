# FINAL FIX - Simple two-stage build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy entire project (Docker will handle Windows paths)
COPY . .

# Show what was copied (for debugging)
RUN echo "Files in /app:" && ls -la
RUN echo "Files in services:" && ls -la services/
RUN echo "Files in packages:" && ls -la packages/

# Install and build
RUN npm ci --ignore-scripts
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=services/shared-events
RUN npm run build --workspace=services/booking-service

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy built artifacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/services/shared-events ./services/shared-events
COPY --from=builder /app/services/booking-service/dist ./services/booking-service/dist

EXPOSE 4004
CMD ["node", "services/booking-service/dist/index.js"]