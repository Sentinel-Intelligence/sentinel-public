#!/bin/bash
set -euo pipefail

WEBSITE=~/projects/sentinel-public/website
FILES=/tmp/sentinel_deploy

echo "[1/6] Installing d3..."
cd "$WEBSITE" && npm install d3 @types/d3 2>&1 | tail -2

echo "[2/6] Copying ForceGraph component..."
cp /tmp/sentinel_deploy/ForceGraph.tsx "$WEBSITE/src/components/shared/ForceGraph.tsx"

echo "[3/6] Copying updated GraphClient..."
cp /tmp/sentinel_deploy/GraphClient.tsx "$WEBSITE/src/app/(pages)/graph/GraphClient.tsx"

echo "[4/6] Building static site (no lint)..."
cd "$WEBSITE" && npx next build --no-lint 2>&1 | tail -5

echo "[5/6] Deploying to /var/www/sentinel..."
sudo cp -r "$WEBSITE/out/." /var/www/sentinel/

echo "[6/6] Verifying API proxy in nginx..."
if ! grep -q "api/cypher" /etc/nginx/sites-enabled/sentinel; then
  echo "  Adding API proxy rule..."
  sudo sed -i '/location \/ {/i\    location /api/cypher/ {\n        proxy_pass http://127.0.0.1:9090/;\n        proxy_set_header Content-Type application/json;\n    }' /etc/nginx/sites-enabled/sentinel
  sudo nginx -t && sudo nginx -s reload
  echo "  Nginx proxy added and reloaded"
else
  echo "  API proxy already present"
fi

echo ""
echo "=== DEPLOYMENT COMPLETE ==="
echo "Test: curl -s -X POST http://localhost:8080/api/cypher/ -H 'Content-Type: application/json' -d '{\"query\":\"god query\"}' | python -c \"import sys,json; d=json.load(sys.stdin); print(f'Results: {len(d.get(\\\"results\\\",[]))}')\" "
echo "Visit: sentinelintel.org/graph"
