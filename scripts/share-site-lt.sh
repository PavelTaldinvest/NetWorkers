#!/bin/bash
# Публикация сайта через localtunnel (loca.lt) — домен НЕ блокируется в РФ.
# В отличие от Cloudflare (*.trycloudflare.com), который из России часто недоступен.
cd "$(dirname "$0")/.."

# 1. Локальный сервер, если ещё не запущен
if ! curl -s --max-time 2 http://localhost:3000/api/health >/dev/null 2>&1; then
  pkill -f "node server.js" 2>/dev/null; sleep 1
  node server.js > /tmp/server.log 2>&1 &
  sleep 2
fi

# 2. Фиксированный поддомен (чтобы ссылка не менялась между запусками)
SUB_FILE=".tunnel-subdomain"
[ -f "$SUB_FILE" ] || echo "egypt$RANDOM$RANDOM" > "$SUB_FILE"
SUB=$(cat "$SUB_FILE")

# 3. Туннель
pkill -f "localtunnel --port 3000" 2>/dev/null; sleep 1
nohup npx --yes localtunnel --port 3000 --subdomain "$SUB" > /tmp/lt.log 2>&1 &

echo "Ожидание публичного URL..."
for i in $(seq 1 30); do
  URL=$(grep -oE "https://[a-z0-9-]+\.loca\.lt" /tmp/lt.log | head -1)
  [ -n "$URL" ] && echo "🌍 Сайт доступен по ссылке: $URL" && exit 0
  sleep 2
done
echo "Не удалось получить URL, смотрите /tmp/lt.log"
exit 1
