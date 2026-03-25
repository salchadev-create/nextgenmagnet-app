/**
 * Google Drive API v3 yardımcı fonksiyonları
 * Fotoğrafları kullanıcının Drive'ındaki "Souvenir App" klasörüne yükler
 */

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
const UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3';
const FOLDER_NAME = 'Souvenir App';

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
