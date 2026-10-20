#!/bin/bash
# Показывает текущий публичный URL сайта (для доступа с телефона/другого устройства)
URL=$(grep -ohE "https://[a-z0-9-]+\.(loca\.lt|trycloudflare\.com)" /tmp/lt.log /tmp/tunnel.log 2>/dev/null | head -1)
[ -n "$URL" ] && echo "$URL" || echo "Туннель не запущен. Запустите: bash scripts/share-site-lt.sh (рекомендуется, работает из РФ)"
