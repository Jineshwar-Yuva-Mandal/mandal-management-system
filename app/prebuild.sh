#!/bin/sh
# Replace placeholder with environment-specific Render backend URL
if [ -z "$RENDER_BACKEND_URL" ]; then
  echo "ERROR: RENDER_BACKEND_URL not set"
  exit 1
fi
sed "s|RENDER_BACKEND_URL|$RENDER_BACKEND_URL|g" vercel.json > vercel.json.tmp && mv vercel.json.tmp vercel.json
echo "Configured backend: $RENDER_BACKEND_URL"
cat vercel.json | head -10
