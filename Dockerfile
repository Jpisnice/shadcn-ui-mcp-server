# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm ci --only=production && npm cache clean --force

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mcpserver -u 1001

# Change ownership of the app directory to the nodejs user
RUN chown -R mcpserver:nodejs /app
USER mcpserver

# Expose port for SSE transport
EXPOSE 7423

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
    const options = { hostname: 'localhost', port: 7423, path: '/health', method: 'GET' }; \
    const req = http.request(options, (res) => { \
      if (res.statusCode === 200) process.exit(0); \
      else process.exit(1); \
    }); \
    req.on('error', () => process.exit(1)); \
    req.end();"

# Default to SSE mode for containerized deployment
ENV MCP_TRANSPORT_MODE=sse
ENV MCP_HOST=0.0.0.0
ENV MCP_PORT=7423

# Start the server
CMD ["npm", "start", "--", "--mode", "sse", "--host", "0.0.0.0", "--port", "7423"]