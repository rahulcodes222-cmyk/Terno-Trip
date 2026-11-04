# SIMPLE DOCKERFILE THAT WILL WORK
# Using cat with heredoc to avoid JSON parsing issues

FROM node:20-alpine

WORKDIR /app

# Create directory structure
RUN mkdir -p packages/shared/src
RUN mkdir -p services/shared-events/src
RUN mkdir -p services/booking-service/src

# Create package.json files using cat with heredoc
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

RUN cat > services/booking-service/package.json << 'EOF'
{
  "name": "@terno/booking-service",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc"
  },
  "dependencies": {
    "@terno/shared": "*",
    "@terno/shared-events": "*"
  }
}
EOF

# Create root package.json
RUN cat > package.json << 'EOF'
{
  "workspaces": ["packages/*", "services/*"]
}
EOF

# Create source files
RUN echo 'export const sharedConfig = { version: "1.0.0" };' > packages/shared/src/index.ts
RUN echo 'export interface Event { type: string; data: any; }' > services/shared-events/src/index.ts

# Create booking service
RUN cat > services/booking-service/src/index.ts << 'EOF'
import express from "express";
import { sharedConfig } from "@terno/shared";
import { Event } from "@terno/shared-events";

const app = express();
const PORT = process.env.PORT || 4004;

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "booking",
    version: sharedConfig.version
  });
});

app.get("/", (req, res) => {
  res.json({ message: "Booking Service API" });
});

app.listen(PORT, () => {
  console.log(`Booking service running on port ${PORT}`);
});
EOF

# Create tsconfig.json
RUN cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
EOF

# Copy tsconfig
RUN cp tsconfig.json packages/shared/
RUN cp tsconfig.json services/shared-events/
RUN cp tsconfig.json services/booking-service/

# Install dependencies
RUN npm install typescript @types/node express @types/express --save-dev

# Build
RUN cd packages/shared && npm run build
RUN cd services/shared-events && npm run build
RUN cd services/booking-service && npm run build

# Install production deps
WORKDIR /app/services/booking-service
RUN npm install express

EXPOSE 4004
CMD ["node", "dist/index.js"]