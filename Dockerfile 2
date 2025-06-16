# Use Node.js LTS image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all other source files (like llm-proxy.js)
COPY . .

# Expose the port the app uses
EXPOSE 8080

# Run the proxy script when the container starts
CMD ["node", "llm-proxy.js"]