FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY services/shared-events/package*.json ./services/shared-events/
COPY services/trip-service/package*.json ./services/trip-service/
RUN npm ci --ignore-scripts
COPY packages/shared/ ./packages/shared/
COPY services/shared-events/ ./services/shared-events/
COPY services/trip-service/ ./services/trip-service/
COPY tsconfig.json ./
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=services/shared-events
RUN npm run build --workspace=services/trip-service

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/services/shared-events ./services/shared-events
COPY --from=builder /app/services/trip-service/dist ./services/trip-service/dist
COPY --from=builder /app/services/trip-service/package.json ./services/trip-service/package.json
EXPOSE 4003
CMD ["node", "services/trip-service/dist/index.js"]
