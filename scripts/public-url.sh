#!/bin/bash
# Показывает текущий публичный URL сайта (для доступа с телефона/другого устройства)
grep -oE "https://[a-z0-9-]+\.trycloudflare\.com" /tmp/tunnel.log 2>/dev/null | head -1 || echo "Туннель не запущен. Запустите: bash scripts/share-site.sh"
