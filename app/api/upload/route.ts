import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitizar nombre del archivo
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${timestamp}-${cleanFileName}`;

    const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
    const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const r2BucketName = process.env.R2_BUCKET_NAME;
    const r2Endpoint = process.env.R2_ENDPOINT;
    const r2PublicDomain = process.env.R2_PUBLIC_DOMAIN || '';

    // Si existen credenciales de Cloudflare R2 / S3
    if (r2AccessKeyId && r2SecretAccessKey && r2BucketName && r2Endpoint) {
      const s3Client = new S3Client({
        region: 'auto',
        endpoint: r2Endpoint,
        credentials: {
          accessKeyId: r2AccessKeyId,
          secretAccessKey: r2SecretAccessKey,
        },
      });

      const key = `properties/${filename}`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: r2BucketName,
          Key: key,
          Body: buffer,
          ContentType: file.type || 'image/webp',
        })
      );

      const publicUrl = r2PublicDomain
        ? `${r2PublicDomain.replace(/\/$/, '')}/${key}`
        : `${r2Endpoint.replace(/\/$/, '')}/${r2BucketName}/${key}`;

      return NextResponse.json({ url: publicUrl, storage: 'r2' });
    }

    // Fallback de desarrollo local: Guardar en public/uploads/
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch {
      // Directerio ya existe
    }

    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, buffer);

    const localUrl = `/uploads/${filename}`;

    return NextResponse.json({ url: localUrl, storage: 'local' });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    return NextResponse.json(
      { error: 'Falló la subida de la imagen.' },
      { status: 500 }
    );
  }
}
