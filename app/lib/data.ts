import { sql } from '@vercel/postgres';
import {
  User,
  Property,
  PropertyWithPrimaryImage,
  PropertyDetail,
  Image,
  FormattedBooking,
  ReviewWithGuest,
  PropertyFilters,
} from './definitions';
import { unstable_noStore as noStore } from 'next/cache';

const ITEMS_PER_PAGE = 6;

// ==========================================
// PROPERTIES
// ==========================================

export async function fetchFilteredProperties(
  queryOrFilters: string | PropertyFilters,
  currentPage: number = 1,
  categoryParam?: string
) {
  noStore();
  
  let query = '';
  let category = categoryParam || '';
  let minPrice = 0;
  let maxPrice = 999999999;
  let guests = 0;
  let bedrooms = 0;
  let bathrooms = 0;
  let amenities: string[] = [];
  let startDate = '';
  let endDate = '';

  if (typeof queryOrFilters === 'object' && queryOrFilters !== null) {
    query = queryOrFilters.query || '';
    category = queryOrFilters.category || category || '';
    minPrice = queryOrFilters.minPrice || 0;
    maxPrice = queryOrFilters.maxPrice || 999999999;
    guests = queryOrFilters.guests || 0;
    bedrooms = queryOrFilters.bedrooms || 0;
    bathrooms = queryOrFilters.bathrooms || 0;
    amenities = queryOrFilters.amenities || [];
    startDate = queryOrFilters.startDate || '';
    endDate = queryOrFilters.endDate || '';
  } else {
    query = queryOrFilters || '';
  }

  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const hasDateFilter = Boolean(startDate && endDate);

  try {
    let data;
    if (hasDateFilter) {
      data = await sql<PropertyWithPrimaryImage>`
        SELECT 
          p.id, 
          p.title, 
          p.city, 
          p.country, 
          p.category,
          p.price_per_night, 
          p.max_guests,
          p.bedrooms,
          p.bathrooms,
          p.amenities,
          p.rating,
          u.name AS host_name,
          i.url AS image_url
        FROM properties p
        LEFT JOIN users u ON p.host_id = u.id
        LEFT JOIN images i ON p.id = i.property_id AND i.is_primary = true
        WHERE
          (${category ? category : ''} = '' OR p.category ILIKE ${`%${category}%`}) AND
          (p.title ILIKE ${`%${query}%`} OR p.city ILIKE ${`%${query}%`} OR p.country ILIKE ${`%${query}%`}) AND
          (p.price_per_night >= ${minPrice}) AND
          (p.price_per_night <= ${maxPrice}) AND
          (p.max_guests >= ${guests}) AND
          (p.bedrooms >= ${bedrooms}) AND
          (p.bathrooms >= ${bathrooms}) AND
          NOT EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.property_id = p.id
              AND b.status != 'cancelled'
              AND b.start_date < ${endDate}::date
              AND b.end_date > ${startDate}::date
          )
        ORDER BY p.created_at DESC
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
      `;
    } else {
      data = await sql<PropertyWithPrimaryImage>`
        SELECT 
          p.id, 
          p.title, 
          p.city, 
          p.country, 
          p.category,
          p.price_per_night, 
          p.max_guests,
          p.bedrooms,
          p.bathrooms,
          p.amenities,
          p.rating,
          u.name AS host_name,
          i.url AS image_url
        FROM properties p
        LEFT JOIN users u ON p.host_id = u.id
        LEFT JOIN images i ON p.id = i.property_id AND i.is_primary = true
        WHERE
          (${category ? category : ''} = '' OR p.category ILIKE ${`%${category}%`}) AND
          (p.title ILIKE ${`%${query}%`} OR p.city ILIKE ${`%${query}%`} OR p.country ILIKE ${`%${query}%`}) AND
          (p.price_per_night >= ${minPrice}) AND
          (p.price_per_night <= ${maxPrice}) AND
          (p.max_guests >= ${guests}) AND
          (p.bedrooms >= ${bedrooms}) AND
          (p.bathrooms >= ${bathrooms})
        ORDER BY p.created_at DESC
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
      `;
    }

    let rows = data.rows;

    // Filtrar por comodidades (amenities) si fueron seleccionadas
    if (amenities.length > 0) {
      rows = rows.filter((prop) => {
        if (!prop.amenities) return false;
        return amenities.every((a) => prop.amenities.includes(a));
      });
    }

    return rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch properties.');
  }
}

export async function fetchPropertiesPages(
  queryOrFilters: string | PropertyFilters,
  categoryParam?: string
) {
  noStore();

  let query = '';
  let category = categoryParam || '';
  let minPrice = 0;
  let maxPrice = 999999999;
  let guests = 0;
  let bedrooms = 0;
  let bathrooms = 0;
  let startDate = '';
  let endDate = '';

  if (typeof queryOrFilters === 'object' && queryOrFilters !== null) {
    query = queryOrFilters.query || '';
    category = queryOrFilters.category || category || '';
    minPrice = queryOrFilters.minPrice || 0;
    maxPrice = queryOrFilters.maxPrice || 999999999;
    guests = queryOrFilters.guests || 0;
    bedrooms = queryOrFilters.bedrooms || 0;
    bathrooms = queryOrFilters.bathrooms || 0;
    startDate = queryOrFilters.startDate || '';
    endDate = queryOrFilters.endDate || '';
  } else {
    query = queryOrFilters || '';
  }

  const hasDateFilter = Boolean(startDate && endDate);

  try {
    let count;
    if (hasDateFilter) {
      count = await sql`
        SELECT COUNT(*)
        FROM properties p
        WHERE
          (${category ? category : ''} = '' OR p.category ILIKE ${`%${category}%`}) AND
          (p.title ILIKE ${`%${query}%`} OR p.city ILIKE ${`%${query}%`} OR p.country ILIKE ${`%${query}%`}) AND
          (p.price_per_night >= ${minPrice}) AND
          (p.price_per_night <= ${maxPrice}) AND
          (p.max_guests >= ${guests}) AND
          (p.bedrooms >= ${bedrooms}) AND
          (p.bathrooms >= ${bathrooms}) AND
          NOT EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.property_id = p.id
              AND b.status != 'cancelled'
              AND b.start_date < ${endDate}::date
              AND b.end_date > ${startDate}::date
          )
      `;
    } else {
      count = await sql`
        SELECT COUNT(*)
        FROM properties p
        WHERE
          (${category ? category : ''} = '' OR p.category ILIKE ${`%${category}%`}) AND
          (p.title ILIKE ${`%${query}%`} OR p.city ILIKE ${`%${query}%`} OR p.country ILIKE ${`%${query}%`}) AND
          (p.price_per_night >= ${minPrice}) AND
          (p.price_per_night <= ${maxPrice}) AND
          (p.max_guests >= ${guests}) AND
          (p.bedrooms >= ${bedrooms}) AND
          (p.bathrooms >= ${bathrooms})
      `;
    }

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
    const propertyData = await sql`
      SELECT 
        p.*,
        u.name AS host_name,
        u.email AS host_email
      FROM properties p
      LEFT JOIN users u ON p.host_id = u.id
      WHERE p.id = ${id}
    `;

    if (propertyData.rows.length === 0) {
      return null;
    }

    const imagesData = await sql`
      SELECT *
      FROM images
      WHERE property_id = ${id}
      ORDER BY is_primary DESC, created_at ASC
    `;

    const property = propertyData.rows[0];
    
    return {
      ...property,
      images: imagesData.rows
    } as PropertyDetail;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch property details.');
  }
}

// ==========================================
// HOST DASHBOARD
// ==========================================

export async function fetchHostProperties(hostId: string) {
  noStore();
  try {
    const data = await sql<PropertyWithPrimaryImage>`
      SELECT 
        p.id, 
        p.title, 
        p.city, 
        p.country, 
        p.category,
        p.price_per_night, 
        p.max_guests,
        p.bedrooms,
        p.bathrooms,
        p.amenities,
        p.rating,
        p.description,
        i.url AS image_url
      FROM properties p
      LEFT JOIN images i ON p.id = i.property_id AND i.is_primary = true
      WHERE p.host_id = ${hostId}
      ORDER BY p.created_at DESC
    `;
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch host properties.');
  }
}

export async function fetchHostStats(hostId: string) {
  noStore();
  try {
    // 1. Ganancias totales (reservas confirmadas o pendientes, omitimos cancelled)
    const earningsData = await sql`
      SELECT SUM(b.total_price) as total
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.host_id = ${hostId} AND b.status != 'cancelled'
    `;
    const totalEarnings = Number(earningsData.rows[0].total) || 0;

    // 2. Promedio de calificación y número de propiedades
    const ratingData = await sql`
      SELECT AVG(rating) as avg_rating, COUNT(id) as total_props
      FROM properties
      WHERE host_id = ${hostId}
    `;
    const averageRating = Number(ratingData.rows[0].avg_rating) || 0;
    const totalProps = Number(ratingData.rows[0].total_props) || 0;

    // 3. Reservas totales
    const bookingsCountData = await sql`
      SELECT COUNT(b.id) as count
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE p.host_id = ${hostId}
    `;
    const totalBookings = Number(bookingsCountData.rows[0].count) || 0;

    // 4. Lista de reservas
    const bookingsData = await sql`
      SELECT 
        b.id,
        p.title AS property_title,
        u.name AS guest_name,
        b.start_date,
        b.end_date,
        b.total_price,
        b.status
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN users u ON b.guest_id = u.id
      WHERE p.host_id = ${hostId}
      ORDER BY b.created_at DESC
    `;

    return {
      totalEarnings,
      occupancyRate: totalProps > 0 ? 65 : 0, // Mock for now or calculate based on dates
      averageRating,
      totalBookings,
      bookingsList: bookingsData.rows,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch host stats.');
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

// ==========================================
// REVIEWS
// ==========================================

export async function fetchPropertyReviews(propertyId: string) {
  noStore();
  try {
    const data = await sql<ReviewWithGuest>`
      SELECT 
        r.id,
        r.property_id,
        r.guest_id,
        r.rating,
        r.comment,
        r.created_at,
        u.name AS guest_name
      FROM reviews r
      JOIN users u ON r.guest_id = u.id
      WHERE r.property_id = ${propertyId}
      ORDER BY r.created_at DESC
    `;
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

// ==========================================
// GUEST BOOKINGS
// ==========================================

export async function fetchGuestBookings(guestId: string) {
  noStore();
  try {
    const data = await sql<FormattedBooking>`
      SELECT 
        b.id, 
        b.start_date, 
        b.end_date, 
        b.total_price, 
        b.status,
        b.created_at,
        p.title AS property_title,
        p.city AS property_city,
        u.name AS guest_name,
        u.email AS guest_email,
        i.url AS property_image
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN users u ON b.guest_id = u.id
      LEFT JOIN images i ON p.id = i.property_id AND i.is_primary = true
      WHERE b.guest_id = ${guestId}
      ORDER BY b.created_at DESC
    `;
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch guest bookings.');
  }
}

