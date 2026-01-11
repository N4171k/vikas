#!/bin/sh
# Start cron in foreground (runs in background)
crond -f &
# Start the Node.js server
exec node server.js
