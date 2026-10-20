
# Monolith: Vite Frontend + Express Backend

# --- Stage 1: Build Frontend ---
FROM node:22-bookworm-slim AS frontend-build

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./

RUN npm ci --no-audit --no-fund --legacy-peer-deps

COPY frontend/ ./

# Same-origin API requests
ENV VITE_API_URL=

# Clerk publishable key
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

RUN npm run build


# --- Stage 2: Production Runtime ---
FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Install backend production dependencies
COPY backend/package.json backend/package-lock.json ./

RUN npm ci --omit=dev --no-audit --no-fund \
    && npm cache clean --force

# Copy backend source
COPY backend/ ./

# Copy frontend production build
COPY --from=frontend-build /app/frontend/dist ./public

EXPOSE 4000

USER node

# Backend entry point
CMD ["node", "server.js"]
