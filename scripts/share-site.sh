#!/bin/bash
# Запуск локального сервера + бесплатного туннеля Cloudflare (доступ из интернета)
cd "$(dirname "$0")/.."
pkill -f "node server.js" 2>/dev/null; pkill -f "cloudflared tunnel" 2>/dev/null; sleep 1
node server.js > /tmp/server.log 2>&1 &
sleep 2
cloudflared tunnel --url http://localhost:3000 > /tmp/tunnel.log 2>&1 &
echo "Ожидание публичного URL..."
for i in $(seq 1 30); do
  URL=$(grep -oE "https://[a-z0-9-]+\.trycloudflare\.com" /tmp/tunnel.log | head -1)
  [ -n "$URL" ] && echo "🌍 Сайт доступен по ссылке: $URL" && exit 0
  sleep 2
done
echo "Не удалось получить URL, смотрите /tmp/tunnel.log"
