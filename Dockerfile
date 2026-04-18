# ====== Build stage ======
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Copy manifests first for better layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/dealership/package.json ./artifacts/dealership/
COPY lib/db/package.json ./lib/db/
COPY lib/api-spec/package.json ./lib/api-spec/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY lib/integrations-openai-ai-react/package.json ./lib/integrations-openai-ai-react/
COPY lib/integrations-openai-ai-server/package.json ./lib/integrations-openai-ai-server/

RUN pnpm install --frozen-lockfile || pnpm install

# Copy the rest of the source
COPY . .

# Build frontend + backend
ENV NODE_ENV=production
RUN pnpm build

# ====== Runtime stage ======
FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm@9

# Copy built artifacts and node_modules from builder
COPY --from=builder /app /app

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["pnpm", "start"]
