# Base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy and install production dependencies
COPY package*.json ./
RUN npm ci

# Copy the entire source
COPY . .

# Compile TypeScript
# Assumes `typescript` is in `dependencies`
RUN npm run build

# Expose port (if this service needs one; ignored by workers)
EXPOSE 3000

# Default command
CMD ["node", "dist/index.js"]
