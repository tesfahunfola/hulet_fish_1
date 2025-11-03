# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install all dependencies including devDependencies for building
# First check if package-lock.json exists, if not, use npm install
RUN if [ -f "package-lock.json" ]; then \
      npm ci --no-optional; \
    else \
      npm install --no-optional; \
    fi && \
    npm cache clean --force

# Copy source code
COPY . .

# RUN npm run build

# Production stage
FROM node:22-alpine
WORKDIR /app

# Create non-root user and set proper permissions
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

# Copy only necessary files from builder
COPY --from=builder --chown=appuser:appgroup /app/package*.json ./
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/controllers ./controllers
COPY --from=builder --chown=appuser:appgroup /app/models ./models
COPY --from=builder --chown=appuser:appgroup /app/routes ./routes
COPY --from=builder --chown=appuser:appgroup /app/utils ./utils
COPY --from=builder --chown=appuser:appgroup /app/public ./public
COPY --from=builder --chown=appuser:appgroup /app/views ./views
COPY --from=builder --chown=appuser:appgroup /app/app.js .
COPY --from=builder --chown=appuser:appgroup /app/server.js .

# Switch to non-root user
USER appuser

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check (using /api/v1/health as it's a common health check endpoint)
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/health || exit 1

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]