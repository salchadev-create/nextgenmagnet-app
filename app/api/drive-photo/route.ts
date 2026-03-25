import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/drive-photo?fileId=xxx&token=yyy
 *
 * Google Drive'daki bir fotoğrafı proxy olarak döndürür.
 * Tarayıcı doğrudan Drive media URL'ine Authorization header gönderemediği için
 * bu route sunucu tarafında Bearer token ekleyerek dosyayı çeker ve iletir.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get('fileId');
  const token = searchParams.get('token');

  if (!fileId || !token) {
    return NextResponse.json({ error: 'fileId ve token zorunlu' }, { status: 400 });
  }

  const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

  const driveRes = await fetch(driveUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!driveRes.ok) {
    return NextResponse.json(
      { error: `Drive hatası: ${driveRes.statusText}` },
      { status: driveRes.status }
    );
  }

  const contentType = driveRes.headers.get('content-type') ?? 'image/jpeg';
  const buffer = await driveRes.arrayBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
