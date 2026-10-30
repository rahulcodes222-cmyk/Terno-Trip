FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY services/api-gateway/package*.json ./services/api-gateway/
RUN npm ci --ignore-scripts
COPY services/api-gateway/ ./services/api-gateway/
COPY tsconfig.json ./
RUN npm run build --workspace=services/api-gateway

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/services/api-gateway/dist ./services/api-gateway/dist
COPY --from=builder /app/services/api-gateway/package.json ./services/api-gateway/package.json
EXPOSE 4000
CMD ["node", "services/api-gateway/dist/index.js"]
