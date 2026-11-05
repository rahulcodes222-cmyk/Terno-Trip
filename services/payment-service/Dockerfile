# Real Payment Service Dockerfile
# Runs the built TypeScript code with Cashfree integration

FROM node:20-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./

# Install ALL dependencies including cashfree-pg
RUN npm install

# Copy built TypeScript files
COPY dist/ ./dist/

# Copy source files (needed for some runtime operations)
COPY src/ ./src/

# Create production .env file (will be overridden by Render env vars)
RUN echo "PORT=4005" > .env && \
    echo "NODE_ENV=production" >> .env && \
    echo "PAYMENT_PROVIDER=cashfree" >> .env

EXPOSE 4005
CMD ["node", "dist/index.js"]