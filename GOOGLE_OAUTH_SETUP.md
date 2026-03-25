# Google OAuth Setup Guide

## Firebase Console Ayarları

Google OAuth'u çalıştırmak için Firebase Console'da aşağıdaki adımları izleyin:

### 1. Authentication Ayarları
1. [Firebase Console](https://console.firebase.google.com)'a gidin
2. Projenizi (`nextgenmagnet`) seçin
3. Sol menüden **Authentication** → **Sign-in method**'a tıklayın
4. **Google**'ı bulun ve etkinleştirin (toggle'ı ON yapın)
5. Project name ve support email'i doldurun
6. **Save** butonuna tıklayın

## Google Drive API Ayarları (Fotoğraf Yükleme)

### 2. Google Drive API'yi Etkinleştirme
1. [Google Cloud Console](https://console.cloud.google.com)'a gidin
2. Projenizi seçin: `nextgenmagnet`
3. Sol menüden **APIs & Services** → **Library**'e tıklayın
4. Arama kutusuna `Google Drive API` yazın
5. **Google Drive API** kartına tıklayın → **Enable** butonuna basın

### 3. OAuth Consent Screen – Drive Scope Ekleme
1. Sol menüden **APIs & Services** → **OAuth consent screen**'e tıklayın
2. **Edit App** butonuna tıklayın
3. **Scopes** adımına geçin → **Add or Remove Scopes** butonuna tıklayın
4. Aşağıdaki scope'u ekleyin:
   ```
   https://www.googleapis.com/auth/drive.file
   ```
   > Bu scope yalnızca uygulama tarafından oluşturulan dosyalara erişim verir.
5. Kaydedin.

### 4. OAuth Consent Screen Ayarları
1. Google Cloud Console'a [buradan](https://console.cloud.google.com) gidin
2. Üst kısımda projenizi seçin: `nextgenmagnet`
3. Sol menüden **APIs & Services** → **OAuth consent screen**'e tıklayın
4. User Type olarak **External** seçin
5. **Create** butonuna tıklayın
6. Aşağıdaki bilgileri doldurun:
   - **App name**: Souvenir App
   - **User support email**: support@souvenirapp.com (veya email adresiniz)
   - **Developer contact information**: email adresiniz
7. **Save and Continue** butonlarına tıklayın

### 3. İzinler (Scopes)
1. **Add or Remove Scopes** kısmında aşağıdakileri seçin:
   - `email`
   - `profile`
   - `openid`
2. **Save and Continue** butonuna tıklayın

### 4. Test Users (Geliştirme Aşaması için)
1. **Test users** seçeneğinde **Add users** butonuna tıklayın
2. Test etmek istediğiniz Gmail adresini ekleyin
3. **Save and Continue** butonuna tıklayın

### 5. Authorized JavaScript Origins
1. Firebase Console'a geri dönün
2. Authentication → Sign-in method → Google ayarlarına tıklayın
3. **Authorized JavaScript origins** kısmına aşağıdakileri ekleyin:
   - `http://localhost:3000`
   - `http://localhost`
   - `https://nextgenmagnet.firebaseapp.com` (production için)
4. **Save** butonuna tıklayın

### 6. Authorized Redirect URIs
1. Aynı sayfada **Authorized redirect URIs** kısmına aşağıdakileri ekleyin:
   - `http://localhost:3000/__/auth/handler`
   - `https://nextgenmagnet.firebaseapp.com/__/auth/handler`
   - `http://localhost/__/auth/handler`
2. **Save** butonuna tıklayın

## Firestore Ayarları

### Firestore Rules Setup
`firestore.rules` dosyası zaten proje kökünde mevcut. Aşağıdaki kuralları ekleyin:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Kullanıcı verilerine sadece kendi user'lar erişebilir
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Kullanıcı notları
    match /users/{userId}/notes/{noteId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

## Uygulama Tarafında Kontrol

### Gerekli bağımlılıklar zaten yüklenmiş:
- ✅ `firebase` - Ana Firebase paketi
- ✅ `firebase/auth` - Authentication modülü
- ✅ `firebase/firestore` - Veritabanı modülü

### Yapılandırılan dosyalar:
- ✅ `lib/firebase.js` - Firebase config
- ✅ `hooks/useGoogleAuth.ts` - Google OAuth hook
- ✅ `contexts/AuthContext.tsx` - Auth state management
- ✅ `app/(auth)/login/page.tsx` - Login sayfası
- ✅ `app/(dashboard)/page.tsx` - Dashboard (korumalı)

## Test Etme

1. Terminalde projeyi başlatın:
   ```bash
   npm run dev
   ```

2. `http://localhost:3000/login` adresine gidin

3. "Google ile devam et" butonuna tıklayın

4. Google hesabıyla oturum açın

5. Dashboard'a otomatik yönlendirileceksiniz

## Sorun Giderme

### "auth/operation-not-allowed" hatası
- Firebase Console'da Google Sign-In'in etkin olduğundan emin olun

### "CORS Policy" hatası
- Authorized JavaScript Origins ve Redirect URIs'lerin doğru olduğunu kontrol edin

### Popup açılmıyor
- Tarayıcı popup blocker'ının engellediği kontrol edin
- Test user email'in OAuth consent screen'da ekli olduğundan emin olun

## Kaynaklar
- [Firebase Google Sign-In Docs](https://firebase.google.com/docs/auth/web/google-signin)
- [Firebase Authentication Setup](https://firebase.google.com/docs/auth/web/start)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
