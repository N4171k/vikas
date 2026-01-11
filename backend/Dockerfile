FROM node:18-alpine

# Install cron (cronie) and curl
RUN apk add --no-cache curl cronie

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY server.js ./
COPY models/ ./models/

COPY routes/ ./routes/
COPY services/ ./services/
COPY scripts/ ./scripts/
COPY config/ ./config/

# Expose the port (adjust if needed)
EXPOSE 3000

# Add cron file
COPY cron/keepalive /etc/cron.d/keepalive
RUN chmod 0644 /etc/cron.d/keepalive

# Entrypoint script to start cron and the app
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
