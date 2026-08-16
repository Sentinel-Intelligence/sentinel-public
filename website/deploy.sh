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

    # A path that does not exist returns 404, not the homepage.
    # The previous SPA-style fallback to /index.html made every missing
    # page answer 200 with the homepage body, which is how a missing
    # /verify went undetected from outside for five days.
    error_page 404 /404.html;

    # Next.js static assets, content-hashed filenames, cache forever
    location /_next/static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # HTML, API routes, always revalidate
    location / {
        try_files $uri $uri/ =404;
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

echo "[deploy] Testing nginx config..."
sudo nginx -t

echo "[deploy] Reloading nginx..."
sudo nginx -s reload

echo "[deploy] Restarting cloudflared..."
sudo systemctl restart cloudflared

echo "[deploy] Waiting 10s for cloudflared to reconnect..."
sleep 10

echo "[deploy] Verifying this deploy..."
DEPLOY_FAIL=0

status_of() {
    curl -s -o /dev/null -w '%{http_code}' "$1" || echo "000"
}

expect_status() {
    local label="$1" url="$2" want="$3" got
    got="$(status_of "$url")"
    if [ "$got" = "$want" ]; then
        echo "[deploy]   OK   $label status $got"
    else
        echo "[deploy]   FAIL $label status $got, expected $want"
        DEPLOY_FAIL=1
    fi
}

expect_status "homepage" "http://localhost:8080/" "200"
expect_status "verify page" "http://localhost:8080/verify/" "200"
expect_status "verify page, no trailing slash" "http://localhost:8080/verify" "200"
expect_status "nonexistent path" "http://localhost:8080/deploy-probe-path-that-does-not-exist" "404"

VERIFY_BODY="$(curl -s http://localhost:8080/verify/ || true)"
if printf '%s' "$VERIFY_BODY" | grep -q 'receipt-ed25519-3a89049da148a9d4'; then
    echo "[deploy]   OK   verify page carries the announced key identifier"
else
    echo "[deploy]   FAIL verify page body does not carry the key identifier, likely serving the wrong document"
    DEPLOY_FAIL=1
fi

if printf '%s' "$VERIFY_BODY" | grep -q 'rLFteU7TV2dP2UNteJPFJE8h8sJjPjqkLV'; then
    echo "[deploy]   OK   verify page carries the ledger wallet"
else
    echo "[deploy]   FAIL verify page body does not carry the ledger wallet"
    DEPLOY_FAIL=1
fi

HTML_TOTAL="$(find "$WEBROOT" -type f -name '*.html' | wc -l)"
LLC_HITS="$(grep -rl 'Sentinel Intelligence LLC' "$WEBROOT" --include='*.html' 2>/dev/null | wc -l)"
echo "[deploy]   superseded LLC form present in $LLC_HITS of $HTML_TOTAL deployed html files"
if [ "$LLC_HITS" -ne 0 ]; then
    echo "[deploy]   FAIL superseded LLC form still deployed"
    DEPLOY_FAIL=1
fi

if [ "$DEPLOY_FAIL" -ne 0 ]; then
    echo "[deploy] DEPLOY VERIFICATION FAILED"
    exit 1
fi

echo "[deploy] All deploy checks passed. Check sentinelintel.org in fresh incognito."
