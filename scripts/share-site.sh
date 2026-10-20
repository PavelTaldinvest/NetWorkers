#!/bin/bash
# Публикация сайта в интернет через Cloudflare Quick Tunnel (trycloudflare.com).
# Не требует белого IP и настройки роутера. Ссылка живёт, пока запущен процесс.
# ВАЖНО: trycloudflare.com может быть недоступен из РФ. В этом случае используйте
# альтернативные туннели (scripts/share-site-lt.sh) или деплой на Render/Railway.
set -e
pkill -f "cloudflared tunnel" 2>/dev/null || true
sleep 1
nohup cloudflared tunnel --url http://localhost:${PORT:-3000} --no-autoupdate > /tmp/tunnel.log 2>&1 &
echo "Запускаю туннель..."
for i in $(seq 1 20); do
  URL=$(grep -oE "https://[a-z0-9-]+\.trycloudflare\.com" /tmp/tunnel.log | head -1)
  [ -n "$URL" ] && break
  sleep 1
done
if [ -z "$URL" ]; then echo "Не удалось получить URL, смотрите /tmp/tunnel.log"; exit 1; fi
echo "$URL" > .tunnel-url
echo "✅ Сайт опубликован: $URL"
echo "Отправьте эту ссылку нужным людям. Она действует, пока запущен сервер и туннель."
