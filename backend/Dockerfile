
# Stage 1: Building  the NestJS application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Installing dependencies, including development dependencies
RUN npm ci

# Copy Prisma configuration and schema
COPY prisma ./prisma
COPY prisma.config.ts ./

# Generate Prisma Client
RUN npx prisma generate

# Copy the remaining application source
COPY . .

# Compile TypeScript into JavaScript
RUN npm run build


# Stage 2: Run the application
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy generated Prisma Client files
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy compiled application and Prisma files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

EXPOSE 3001

CMD ["node", "dist/main"]
