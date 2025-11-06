# Use Node.js 22 Alpine as the base image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY "Hulet Fish/package*.json" ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application
COPY "Hulet Fish/" ./

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]