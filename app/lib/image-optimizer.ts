/**
 * Compresión de imágenes en el cliente (Browser) y conversión a formato WebP optimizado.
 * Reduce significativamente el ancho de banda y costo de almacenamiento.
 */
export async function compressAndConvertToWebP(
  file: File,
  maxWidth = 1400,
  quality = 0.82
): Promise<File> {
  // Si el archivo ya es un WebP muy pequeño (ej. < 100KB), retornarlo directamente
  if (file.type === 'image/webp' && file.size < 100 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.width;
      let height = img.height;

      // Calcular nuevas dimensiones manteniendo la relación de aspecto
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No se pudo obtener el contexto 2D del Canvas.'));
        return;
      }

      // Renderizar la imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir a blob WebP
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Falló la conversión de la imagen a WebP.'));
            return;
          }

          // Generar nuevo nombre con extensión .webp
          const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const newFileName = `${originalNameWithoutExt}_optimized.webp`;

          const optimizedFile = new File([blob], newFileName, {
            type: 'image/webp',
            lastModified: Date.now(),
          });

          resolve(optimizedFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };

    img.src = objectUrl;
  });
}
