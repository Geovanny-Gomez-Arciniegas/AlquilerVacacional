import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = params.id;
    if (!propertyId) {
      return NextResponse.json({ error: 'ID de propiedad requerido' }, { status: 400 });
    }

    const imagesResult = await sql`
      SELECT url, is_primary
      FROM images
      WHERE property_id = ${propertyId}
      ORDER BY is_primary DESC, created_at ASC
    `;

    return NextResponse.json(imagesResult.rows);
  } catch (error) {
    console.error('Error fetching property images:', error);
    return NextResponse.json(
      { error: 'Error al consultar imágenes de la propiedad' },
      { status: 500 }
    );
  }
}
