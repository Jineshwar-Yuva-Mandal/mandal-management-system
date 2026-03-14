#!/bin/sh
# Replace placeholder with environment-specific Render backend URL
if [ -z "$RENDER_BACKEND_URL" ]; then
  echo "ERROR: RENDER_BACKEND_URL not set"
  exit 1
fi
sed -i "s|RENDER_BACKEND_URL|$RENDER_BACKEND_URL|g" vercel.json
echo "Configured backend: $RENDER_BACKEND_URL"
