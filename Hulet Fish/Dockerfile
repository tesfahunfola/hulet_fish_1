# Dockerfile for Express backend
FROM node:22-alpine
WORKDIR /app

# Install production dependencies for backend
# Adjust "Hulet Fish" to match your actual folder name if different
# Copy package files - try both package.json and package-lock.json
COPY "Hulet Fish/package.json" ./
# Try to copy package-lock.json, but use npm install if it doesn't exist
RUN if [ -f "Hulet Fish/package-lock.json" ]; then \
      cp "Hulet Fish/package-lock.json" ./ && \
      npm ci --omit=dev; \
    else \
      echo "package-lock.json not found, using npm install" && \
      npm install --production; \
    fi

# Copy backend source
# Adjust "Hulet Fish" to match your actual folder name if different
COPY "Hulet Fish/" ./

# Expose port and set production env
ENV NODE_ENV=production
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]