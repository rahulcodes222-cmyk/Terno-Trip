# Production Booking Service Dockerfile
# Builds TypeScript and runs the actual booking service

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY services/booking-service/package*.json ./services/booking-service/
COPY services/shared/package*.json ./services/shared/
COPY services/shared-events/package*.json ./services/shared-events/

# Install dependencies
RUN npm install

# Copy source code
COPY services/booking-service/ ./services/booking-service/
COPY services/shared/ ./services/shared/
COPY services/shared-events/ ./services/shared-events/

# Build shared packages first
RUN npm run build --workspace=@terno/shared
RUN npm run build --workspace=@terno/shared-events

# Build booking service
WORKDIR /app/services/booking-service
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built artifacts
COPY --from=builder /app/services/booking-service/dist ./dist
COPY --from=builder /app/services/booking-service/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/services/shared/dist ./node_modules/@terno/shared
COPY --from=builder /app/services/shared-events/dist ./node_modules/@terno/shared-events

# Create a proper .env file with production defaults
RUN echo "PORT=4004" > .env && \
    echo "NODE_ENV=production" >> .env && \
    echo "# Production URLs will be set via Render environment variables" >> .env && \
    echo "# TRIP_SERVICE_URL=https://terno-trip-4.onrender.com" >> .env && \
    echo "# NOTIFICATION_SERVICE_URL=https://terno-trip-8.onrender.com" >> .env

EXPOSE 4004
CMD ["node", "dist/index.js"]