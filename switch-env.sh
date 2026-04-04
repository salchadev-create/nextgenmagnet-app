#!/bin/bash

# Ortam dosyasını değiştir
# Kullanım: ./switch-env.sh prod   veya   ./switch-env.sh dev

ENV=${1:-dev}

if [ "$ENV" = "prod" ] || [ "$ENV" = "production" ]; then
  if [ -f .env.production ]; then
    cp .env.local .env.local.bak
    cp .env.production .env.local
    echo "✓ Ortam Production'a geçildi (.env.production -> .env.local)"
    echo "💡 Şimdi 'npm run dev' çalıştırabilirsiniz"
  else
    echo "✗ Hata: .env.production dosyası bulunamadı"
  fi
elif [ "$ENV" = "dev" ] || [ "$ENV" = "development" ]; then
  if [ -f .env.local.bak ]; then
    cp .env.local.bak .env.local
    echo "✓ Ortam Development'a geçildi (.env.local.bak -> .env.local)"
  else
    echo "✓ Zaten Development ortamında"
  fi
else
  echo "Kullanım: ./switch-env.sh [dev|prod]"
  echo ""
  echo "Örnekler:"
  echo "  ./switch-env.sh dev       - Development ortamına geç"
  echo "  ./switch-env.sh prod      - Production ortamına geç"
fi
