/**
 * Google Drive API v3 yardımcı fonksiyonları
 * Fotoğrafları kullanıcının Drive'ındaki "happiotag" klasörüne yükler
 */

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3';
const FOLDER_NAME = 'happiotag';

/**
 * "Souvenir App" klasörünü Drive'da arar, yoksa oluşturur.
 * Klasör ID'sini döner.
 */
export async function getOrCreateAppFolder(accessToken: string): Promise<string> {
  // Mevcut klasörü ara
  const searchRes = await fetch(
    `${DRIVE_API_URL}/files?q=name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name)`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!searchRes.ok) {
    throw new Error(`Drive klasör arama hatası: ${searchRes.statusText}`);
  }

  const searchData = await searchRes.json();

  if (searchData.files && searchData.files.length > 0) {
    // Klasör zaten var
    return searchData.files[0].id as string;
  }

  // Klasör yok, oluştur
  const createRes = await fetch(`${DRIVE_API_URL}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!createRes.ok) {
    throw new Error(`Drive klasör oluşturma hatası: ${createRes.statusText}`);
  }

  const createData = await createRes.json();
  return createData.id as string;
}

export interface DriveUploadResult {
  id: string;
  name: string;
  webViewLink: string;
}

/**
 * Bir dosyayı (base64 data URL veya File objesi) Google Drive'a yükler.
 * folderId: yüklenecek klasörün ID'si
 */
export async function uploadFileToDrive(
  accessToken: string,
  file: File,
  folderId: string
): Promise<DriveUploadResult> {
  // Metadata
  const metadata = {
    name: file.name || `souvenir_${Date.now()}.jpg`,
    parents: [folderId],
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', file);

  const uploadRes = await fetch(
    `${UPLOAD_URL}/files?uploadType=multipart&fields=id,name,webViewLink`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    }
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`Drive yükleme hatası: ${err}`);
  }

  const data = await uploadRes.json();
  return data as DriveUploadResult;
}

/**
 * Belirtilen dosyayı Google Drive'dan kalıcı olarak siler.
 */
export async function deleteFileFromDrive(
  accessToken: string,
  fileId: string
): Promise<void> {
  const res = await fetch(`${DRIVE_API_URL}/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  // 204 No Content başarılı silme anlamına gelir
  if (!res.ok && res.status !== 204) {
    const err = await res.text();
    throw new Error(`Drive silme hatası: ${err}`);
  }
}

export interface DrivePhoto {
  id: string;
  name: string;
  /** Tarayıcıda doğrudan gösterilecek URL (thumbnail veya download) */
  src: string;
}

/**
 * Belirtilen klasördeki tüm resim dosyalarını listeler ve
 * her biri için Next.js proxy URL döndürür (tarayıcı CORS kısıtlaması olmadan görüntülenir).
 */
export async function listPhotosFromFolder(
  accessToken: string,
  folderId: string
): Promise<DrivePhoto[]> {
  const q = encodeURIComponent(
    `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`
  );

  const res = await fetch(
    `${DRIVE_API_URL}/files?q=${q}&fields=files(id,name)&orderBy=createdTime&pageSize=100`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    throw new Error(`Drive liste hatası: ${res.statusText}`);
  }

  const data = await res.json();
  const files: { id: string; name: string }[] = data.files ?? [];

  // Proxy route üzerinden çekilen URL – tarayıcıdan doğrudan Bearer header gönderilemez
  return files.map((f) => ({
    id: f.id,
    name: f.name,
    src: `/api/drive-photo?fileId=${f.id}&token=${encodeURIComponent(accessToken)}`,
  }));
}
