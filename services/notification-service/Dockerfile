# NOTIFICATION SERVICE DOCKERFILE - WORKING VERSION FOR RENDER
# Uses stub packages for compilation but includes actual notification service routes

FROM node:20-alpine

WORKDIR /app

# Create directory structure
RUN mkdir -p packages/shared/src
RUN mkdir -p services/shared-events/src
RUN mkdir -p services/notification-service/src

# Create minimal shared package for compilation
RUN cat > packages/shared/package.json << 'EOF'
{
  "name": "@terno/shared",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc --project tsconfig.json"
  }
}
EOF

RUN cat > packages/shared/src/index.ts << 'EOF'
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const sharedConfig = {
  version: "1.0.0"
};
EOF

# Create minimal shared-events package for compilation
RUN cat > services/shared-events/package.json << 'EOF'
{
  "name": "@terno/shared-events",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc --project tsconfig.json"
  }
}
EOF

RUN cat > services/shared-events/src/index.ts << 'EOF'
export interface Event {
  type: string;
  data: any;
}

export const eventBus = {
  emit: (event: Event) => console.log('Event emitted:', event.type)
};

export const BOOKING_CREATED = "booking_created";
export const BOOKING_CONFIRMED = "booking_confirmed";
export const PAYMENT_SUCCEEDED = "payment_succeeded";
EOF

# Create workspace config
RUN cat > package.json << 'EOF'
{
  "workspaces": ["packages/*", "services/*"]
}
EOF

# Copy ACTUAL notification service source code (this is key!)
COPY services/notification-service/package.json services/notification-service/
COPY services/notification-service/src/ services/notification-service/src/
COPY services/notification-service/tsconfig.json services/notification-service/

# Create tsconfig
RUN cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "strict": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
EOF

RUN cp tsconfig.json packages/shared/
RUN cp tsconfig.json services/shared-events/
RUN cp tsconfig.json services/notification-service/

# Install dependencies
RUN npm install typescript @types/node --save-dev

# Build shared packages
RUN cd packages/shared && npm run build
RUN cd services/shared-events && npm run build

# Build notification service WITH ACTUAL CODE
RUN cd services/notification-service && npm run build

# Install production dependencies
WORKDIR /app/services/notification-service

# Install exact dependencies from package.json
RUN if [ -f "package-lock.json" ]; then npm ci --only=production; else npm install express dotenv zod mongoose nodemailer @terno/shared @terno/shared-events; fi

EXPOSE 4006
CMD ["node", "dist/index.js"]