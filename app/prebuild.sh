#!/bin/sh
# Build using Vercel Build Output API — dynamically sets the Render backend URL
set -e

if [ -z "$RENDER_BACKEND_URL" ]; then
  echo "ERROR: RENDER_BACKEND_URL not set"
  exit 1
fi

echo "[prebuild] Backend: $RENDER_BACKEND_URL"

# Create Build Output API structure
mkdir -p .vercel/output/static

# Copy all static files (everything except prebuild.sh and vercel.json)
for item in *; do
  case "$item" in
    prebuild.sh|vercel.json|.vercel) continue ;;
    *) cp -r "$item" .vercel/output/static/ ;;
  esac
done

# Generate config.json with dynamic routing
cat > .vercel/output/config.json << EOF
{
  "version": 3,
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "$RENDER_BACKEND_URL/api/\$1",
      "headers": {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/",
      "dest": "/launchpage.html"
    }
  ]
}
EOF

echo "[prebuild] Build Output API generated"
cat .vercel/output/config.json
