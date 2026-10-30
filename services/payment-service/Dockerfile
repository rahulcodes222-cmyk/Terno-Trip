FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY services/shared-events/package*.json ./services/shared-events/
COPY services/payment-service/package*.json ./services/payment-service/
RUN npm ci --ignore-scripts
COPY packages/shared/ ./packages/shared/
COPY services/shared-events/ ./services/shared-events/
COPY services/payment-service/ ./services/payment-service/
COPY tsconfig.json ./
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=services/shared-events
RUN npm run build --workspace=services/payment-service

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/services/shared-events ./services/shared-events
COPY --from=builder /app/services/payment-service/dist ./services/payment-service/dist
COPY --from=builder /app/services/payment-service/package.json ./services/payment-service/package.json
EXPOSE 4005
CMD ["node", "services/payment-service/dist/index.js"]
