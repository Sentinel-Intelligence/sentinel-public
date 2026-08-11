#!/usr/bin/env bash
set -euo pipefail

WEBROOT="/var/www/sentinel"
OUT="$(dirname "$0")/out"
NGINX_CONF="/etc/nginx/sites-enabled/sentinel"

echo "[deploy] Nuking $WEBROOT..."
sudo rm -rf "$WEBROOT"/*

echo "[deploy] Copying new build..."
sudo cp -r "$OUT"/. "$WEBROOT/"

echo "[deploy] Deploying STYX landing..."
sudo mkdir -p /var/www/styx
sudo cp /home/toasty/projects/lattice/forge/styx/web/index.html /var/www/styx/index.html

echo "[deploy] Fixing nginx config (adding _next/static immutable block)..."
sudo tee "$NGINX_CONF" > /dev/null << 'NGINX_EOF'
server {
    listen 8080;
    server_name localhost;
    root /var/www/sentinel;
    index index.html;
    include snippets/sentinel-api-proxy.conf;

    # Next.js static assets — content-hashed filenames, cache forever
    location /_next/static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # HTML, API routes — always revalidate
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /data/ {
        expires 5m;
        add_header Cache-Control "public";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;
    gzip_min_length 256;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}

server {
    listen 8081;
    server_name styx.sentinelintel.org;
    root /var/www/styx;
    index index.html;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
NGINX_EOF

echo "[deploy] Reloading nginx..."
sudo nginx -s reload

echo "[deploy] Restarting cloudflared..."
sudo systemctl restart cloudflared

echo "[deploy] Waiting 10s for cloudflared to reconnect..."
sleep 10

echo "[deploy] Verifying localhost..."
curl -sf http://localhost:8080/ | grep -o '33M\|33003274\|463K' | head -5

echo "[deploy] Done. Check sentinelintel.org in fresh incognito."
