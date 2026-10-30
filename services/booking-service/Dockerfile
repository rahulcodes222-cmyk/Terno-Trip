FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY services/shared-events/package*.json ./services/shared-events/
COPY services/booking-service/package*.json ./services/booking-service/
RUN npm ci --ignore-scripts
COPY packages/shared/ ./packages/shared/
COPY services/shared-events/ ./services/shared-events/
COPY services/booking-service/ ./services/booking-service/
COPY tsconfig.json ./
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=services/shared-events
RUN npm run build --workspace=services/booking-service

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/services/shared-events ./services/shared-events
COPY --from=builder /app/services/booking-service/dist ./services/booking-service/dist
COPY --from=builder /app/services/booking-service/package.json ./services/booking-service/package.json
EXPOSE 4004
CMD ["node", "services/booking-service/dist/index.js"]
