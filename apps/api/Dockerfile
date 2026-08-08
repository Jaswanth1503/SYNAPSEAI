# ==========================================
# STAGE 1: Builder
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json ./
COPY tsconfig.json ./

# Install dependencies
RUN pnpm install --frozen-lockfile || npm install

# Copy source code
COPY src ./src

# Build TypeScript to /dist
RUN pnpm build || npm run build

# ==========================================
# STAGE 2: Runner
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Set Production Environment
ENV NODE_ENV=production
ENV PORT=5000

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json ./

# Install production dependencies only
RUN pnpm install --prod || npm install --omit=dev

# Copy compiled dist from builder
COPY --from=builder /app/dist ./dist

# Create non-root user for security
RUN addgroup -S nodejs && adduser -S express -G nodejs
USER express

EXPOSE 5000

CMD ["node", "dist/index.js"]
