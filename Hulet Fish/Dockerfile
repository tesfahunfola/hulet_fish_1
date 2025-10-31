# Dockerfile for Express backend
FROM node:22-alpine
WORKDIR /app

# Install production dependencies for backend
# Adjust "Hulet Fish" to match your actual folder name if different
COPY "Hulet Fish/package.json" "Hulet Fish/package-lock.json" ./
RUN npm ci --omit=dev

# Copy backend source
# Adjust "Hulet Fish" to match your actual folder name if different
COPY "Hulet Fish/" ./

# Expose port and set production env
ENV NODE_ENV=production
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]