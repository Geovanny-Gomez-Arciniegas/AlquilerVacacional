import { sql } from '@vercel/postgres';
import {
  User,
  Property,
  PropertyWithPrimaryImage,
  PropertyDetail,
  Image,
  FormattedBooking,
} from './definitions';
import { unstable_noStore as noStore } from 'next/cache';

const ITEMS_PER_PAGE = 6;

// ==========================================
// PROPERTIES
// ==========================================

export async function fetchFilteredProperties(query: string, currentPage: number) {
  noStore();
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const data = await sql<PropertyWithPrimaryImage>`
      SELECT 
        p.id, 
        p.title, 
        p.city, 
        p.country, 
        p.price_per_night, 
        p.max_guests,
        u.name AS host_name,
        i.url AS image_url
      FROM properties p
      LEFT JOIN users u ON p.host_id = u.id
      LEFT JOIN images i ON p.id = i.property_id AND i.is_primary = true
      WHERE
        p.title ILIKE ${`%${query}%`} OR
        p.city ILIKE ${`%${query}%`} OR
        p.country ILIKE ${`%${query}%`}
      ORDER BY p.created_at DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch properties.');
  }
}

export async function fetchPropertiesPages(query: string) {
  noStore();
  try {
    const count = await sql`
      SELECT COUNT(*)
      FROM properties p
      WHERE
        p.title ILIKE ${`%${query}%`} OR
        p.city ILIKE ${`%${query}%`} OR
        p.country ILIKE ${`%${query}%`}
    `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of properties.');
  }
}

export async function fetchPropertyById(id: string) {
  noStore();
  try {
    // Primero, traer los detalles de la propiedad y el anfitrión
    const data = await sql<PropertyDetail>`
      SELECT 
        p.*,
        u.name AS host_name,
        u.email AS host_email
      FROM properties p
      LEFT JOIN users u ON p.host_id = u.id
      WHERE p.id = ${id}
    `;

    if (data.rows.length === 0) {
      return null;
    }

    const property = data.rows[0];

    // Segundo, traer todas las imágenes de esta propiedad
    const imagesData = await sql<Image>`
      SELECT * 
      FROM images 
      WHERE property_id = ${id}
      ORDER BY is_primary DESC, created_at ASC
    `;

    property.images = imagesData.rows;

    return property;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch property details.');
  }
}

// ==========================================
// BOOKINGS
// ==========================================

export async function fetchLatestBookings() {
  noStore();
  try {
    const data = await sql<FormattedBooking>`
      SELECT 
        b.id, 
        b.start_date, 
        b.end_date, 
        b.total_price, 
        b.status,
        p.title AS property_title,
        p.city AS property_city,
        u.name AS guest_name,
        u.email AS guest_email
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN users u ON b.guest_id = u.id
      ORDER BY b.created_at DESC
      LIMIT 5
    `;

    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest bookings.');
  }
}

// ==========================================
// USERS
// ==========================================

export async function getUser(email: string) {
  try {
    const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
