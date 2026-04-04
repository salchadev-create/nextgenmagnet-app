# Dev/Prod Ortam Ay## NPM Scripts

```bash
# Development ortamında çalıştır (default)
npm run dev

# Production ortamında build et
npm run build:prod

# Başla (build'den sonra)
npm start
```da projenizin dev ve prod ortamlarının nasıl yapılandırıldığını bulabilirsiniz.

## Ortam Dosyaları

### `.env.local` (Development)
- **Amaç**: Yerel geliştirme ortamında kullanılır
- **Firebase Projesi**: `happiotag`
- **Veritabanı**: `db-happiotag`

### `.env.production` (Production)
- **Amaç**: Üretim ortamında kullanılır
- **Firebase Projesi**: `happiotag-prod`
- **Veritabanı**: `db-happiotag`

### `.env.example`
- Template dosyası, yeni ortamlar oluştururken referans olarak kullanılabilir

## NPM Scripts

```bash
# Development ortamında çalıştır (default)
npm run dev

# Production konfigürasyonuyla dev server'ı çalıştır
npm run dev:prod

# Development ortamında build et
npm run build:dev

# Production ortamında build et (production deploy'ı için)
npm run build:prod

# Başla (build'den sonra)
npm start
```

## Ortam Değişkenleri

Tüm gerekli Firebase konfigürasyonları `.env.local` ve `.env.production` dosyalarında bulunur:

- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API Key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase Auth Domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase Project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase Storage Bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase Messaging Sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase App ID
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` - Firebase Measurement ID
- `NEXT_PUBLIC_DATABASE_NAME` - Firestore Database Name
- `NEXT_PUBLIC_ENVIRONMENT` - Ortam türü (`development` veya `production`)

## Ortam Dosyaları Arasında Geçiş

Prod ortamını test etmek istiyorsanız, env dosyalarını değiştirebilirsiniz:

```bash
# Production ortamına geç
./switch-env.sh prod

# Development ortamına geri dön
./switch-env.sh dev

# Sonra dev server'ı çalıştır
npm run dev
```

**Not:** Script otomatik olarak `.env.local.bak` yedeklemesi tutar.

Uygulamada ortam ayarlarına `lib/envConfig.ts` dosyasından erişebilirsiniz:

```typescript
import { envConfig } from '@/lib/envConfig';

// Ortam kontrolü
if (envConfig.isDev) {
  console.log('Development ortamında çalışıyoruz');
}

// Firebase konfigürasyonuna erişim
const projectId = envConfig.firebaseConfig.projectId;

// Ortam adını al
console.log(`Mevcut ortam: ${envConfig.environment}`);
```

## Deploy Edilirken

**Production'a deploy ettiğinizde:**

1. `.env.production` dosyasının doğru konfigürasyona sahip olduğundan emin olun
2. Build komutunu çalıştırın: `npm run build:prod`
3. Deploy edin: `npm start`

Veya doğrudan hosting servisinize (Vercel, Firebase Hosting, vb.) `.env.production` ayarlarını konfigüre edin.

## Firestore Rules ve Indexes

Dev ve Prod ortamlarında ayrı `firestore.rules` ve `firestore.indexes.json` dosyaları varsa, Firebase CLI ile doğru ortamda deploy edildiğinden emin olun:

```bash
# Dev ortamına deploy et
firebase deploy --only firestore:rules --project happiotag

# Prod ortamına deploy et
firebase deploy --only firestore:rules --project happiotag-prod
```

## Güvenlik Notları

- **Asla** production API keys'lerini git'e commit etmeyin
- `.env.local` ve `.env.production` dosyalarını `.gitignore`'e ekleyin (zaten eklenmiş olmalı)
- Yalnızca `NEXT_PUBLIC_` prefix'li değişkenler client-side'da görünür
- Hassas veriler için server-side environment variables kullanın
