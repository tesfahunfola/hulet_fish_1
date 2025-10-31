# Multi-stage Dockerfile to build the React (Vite) frontend and run the Express backend
# - Stage 1 builds the frontend and outputs to /dist
# - Stage 2 installs backend dependencies, copies the built frontend into /public and runs the server

### Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/Etxplore-frontend

# Install dependencies (copy package.json first for better cache layering)
COPY Etxplore-frontend/package*.json ./
RUN npm install --legacy-peer-deps

# Copy rest of frontend sources and build
COPY Etxplore-frontend/ ./
RUN npm run build


### Stage 2: Build and run backend
FROM node:18-alpine AS app
WORKDIR /app

# Install production dependencies for backend
COPY package*.json ./
RUN npm install --production --silent

# Copy backend source
COPY . .

# Copy built frontend into backend public folder so Express can serve static files
RUN mkdir -p ./public
COPY --from=frontend-builder /app/Etxplore-frontend/dist ./public

# Expose port and set production env
ENV NODE_ENV=production
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
