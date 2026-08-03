'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcrypt';
import { signIn } from '@/auth';

const DEFAULT_IMAGES: Record<string, string> = {
  'Cabañas': 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80',
  'Casas': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'Apartamentos': 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  'Fincas': 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
  'Habitaciones': 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
};

export async function createProperty(formData: FormData, hostId: string) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const location = formData.get('location') as string;
  const price = Number(formData.get('price'));
  const capacity = Number(formData.get('capacity'));
  const bedrooms = Number(formData.get('bedrooms'));
  const bathrooms = Number(formData.get('bathrooms'));
  const amenities = formData.getAll('amenities') as string[];
  const useDefaultImage = formData.get('useDefaultImage') === 'true';
  const customImageUrl = formData.get('image') as string;
  const uploadedUrls = formData.getAll('imageUrls') as string[];
  
  let allImageUrls: string[] = [];
  if (uploadedUrls.length > 0) {
    allImageUrls = uploadedUrls;
  } else if (!useDefaultImage && customImageUrl) {
    allImageUrls = [customImageUrl];
  } else {
    allImageUrls = [DEFAULT_IMAGES[category] || DEFAULT_IMAGES['Cabañas']];
  }

  const city = location;
  const country = 'Colombia'; // Default para simplificar

  try {
    const insertedProperty = await sql`
      INSERT INTO properties (host_id, title, description, city, country, category, price_per_night, max_guests, bedrooms, bathrooms, amenities, rating)
      VALUES (${hostId}, ${title}, ${description}, ${city}, ${country}, ${category}, ${price}, ${capacity}, ${bedrooms}, ${bathrooms}, ${`{${amenities.join(',')}}`}, 5.0)
      RETURNING id
    `;
    
    const propertyId = insertedProperty.rows[0].id;
    
    // Insertar imágenes (la primera marcada como is_primary = true)
    for (let i = 0; i < allImageUrls.length; i++) {
      const isPrimary = i === 0;
      await sql`
        INSERT INTO images (property_id, url, is_primary)
        VALUES (${propertyId}, ${allImageUrls[i]}, ${isPrimary})
      `;
    }

    revalidatePath('/host');
    revalidatePath('/');
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create property.');
  }
}

export async function updateProperty(id: string, formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const location = formData.get('location') as string;
  const price = Number(formData.get('price'));
  const capacity = Number(formData.get('capacity'));
  const bedrooms = Number(formData.get('bedrooms'));
  const bathrooms = Number(formData.get('bathrooms'));
  const amenities = formData.getAll('amenities') as string[];
  const useDefaultImage = formData.get('useDefaultImage') === 'true';
  const customImageUrl = formData.get('image') as string;
  const uploadedUrls = formData.getAll('imageUrls') as string[];
  
  let allImageUrls: string[] = [];
  if (uploadedUrls.length > 0) {
    allImageUrls = uploadedUrls;
  } else if (!useDefaultImage && customImageUrl) {
    allImageUrls = [customImageUrl];
  } else if (useDefaultImage) {
    allImageUrls = [DEFAULT_IMAGES[category] || DEFAULT_IMAGES['Cabañas']];
  }

  const city = location;
  const country = 'Colombia'; // Default para simplificar

  try {
    await sql`
      UPDATE properties
      SET 
        title = ${title},
        description = ${description},
        city = ${city},
        country = ${country},
        category = ${category},
        price_per_night = ${price},
        max_guests = ${capacity},
        bedrooms = ${bedrooms},
        bathrooms = ${bathrooms},
        amenities = ${`{${amenities.join(',')}}`}
      WHERE id = ${id}
    `;

    if (allImageUrls.length > 0) {
      await sql`DELETE FROM images WHERE property_id = ${id}`;
      for (let i = 0; i < allImageUrls.length; i++) {
        const isPrimary = i === 0;
        await sql`
          INSERT INTO images (property_id, url, is_primary)
          VALUES (${id}, ${allImageUrls[i]}, ${isPrimary})
        `;
      }
    }

    revalidatePath('/host');
    revalidatePath('/');
    revalidatePath(`/alojamientos/${id}`);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to update property.');
  }
}


export async function deleteProperty(id: string) {
  try {
    await sql`DELETE FROM properties WHERE id = ${id}`;
    revalidatePath('/host');
    revalidatePath('/');
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to delete property.');
  }
}

export async function simulateBooking(hostId: string) {
  try {
    // 1. Get a random property for this host
    const propertiesData = await sql`SELECT id, price_per_night FROM properties WHERE host_id = ${hostId}`;
    if (propertiesData.rows.length === 0) return;
    
    const randomProp = propertiesData.rows[Math.floor(Math.random() * propertiesData.rows.length)];
    
    // 2. Get a random guest (just get any user who is a guest)
    const guestsData = await sql`SELECT id FROM users WHERE role = 'guest' LIMIT 10`;
    let guestId = null;
    if (guestsData.rows.length > 0) {
      guestId = guestsData.rows[Math.floor(Math.random() * guestsData.rows.length)].id;
    } else {
      // If no guest found, just pick any user
      const usersData = await sql`SELECT id FROM users LIMIT 10`;
      if (usersData.rows.length > 0) {
        guestId = usersData.rows[Math.floor(Math.random() * usersData.rows.length)].id;
      }
    }
    
    if (!guestId) return;

    // 3. Generate random nights and dates
    const nights = Math.floor(Math.random() * 5) + 2;
    const totalPrice = randomProp.price_per_night * nights;
    
    const today = new Date();
    const futureDays = Math.floor(Math.random() * 15) + 1;
    const checkInDate = new Date(today);
    checkInDate.setDate(today.getDate() + futureDays);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkInDate.getDate() + nights);
    
    const padZero = (n: number) => String(n).padStart(2, '0');
    const formatDate = (d: Date) => `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())}`;
    
    const statuses = ['confirmed', 'pending', 'cancelled'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    await sql`
      INSERT INTO bookings (property_id, guest_id, start_date, end_date, total_price, status)
      VALUES (${randomProp.id}, ${guestId}, ${formatDate(checkInDate)}, ${formatDate(checkOutDate)}, ${totalPrice}, ${status})
    `;
    
    revalidatePath('/host');
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to simulate booking.');
  }
}

export async function createBooking(formData: FormData) {
  const propertyId = formData.get('propertyId') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;
  const totalPrice = Number(formData.get('totalPrice'));
  let guestId = formData.get('guestId') as string;

  if (!guestId) {
    const guestUser = await sql`SELECT id FROM users WHERE role = 'guest' LIMIT 1`;
    guestId = guestUser.rows.length > 0 ? guestUser.rows[0].id : 'e8b995cd-4567-4dc2-bccd-671e3db4a451';
  }

  try {
    await sql`
      INSERT INTO bookings (property_id, guest_id, start_date, end_date, total_price, status)
      VALUES (${propertyId}, ${guestId}, ${startDate}, ${endDate}, ${totalPrice}, 'confirmed')
    `;

    revalidatePath('/host');
    revalidatePath('/mis-reservas');
    revalidatePath(`/alojamientos/${propertyId}`);
    return { success: true };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create booking.');
  }
}

export async function cancelBooking(bookingId: string) {
  try {
    await sql`
      UPDATE bookings
      SET status = 'cancelled'
      WHERE id = ${bookingId}
    `;

    revalidatePath('/host');
    revalidatePath('/mis-reservas');
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to cancel booking.');
  }
}

export async function createReview(formData: FormData) {
  const propertyId = formData.get('propertyId') as string;
  const rating = Number(formData.get('rating'));
  const comment = formData.get('comment') as string;
  let guestId = formData.get('guestId') as string;

  if (!guestId) {
    const guestUser = await sql`SELECT id FROM users WHERE role = 'guest' LIMIT 1`;
    guestId = guestUser.rows.length > 0 ? guestUser.rows[0].id : 'e8b995cd-4567-4dc2-bccd-671e3db4a451';
  }

  try {
    await sql`
      INSERT INTO reviews (property_id, guest_id, rating, comment)
      VALUES (${propertyId}, ${guestId}, ${rating}, ${comment})
    `;

    const avgData = await sql`
      SELECT AVG(rating) as avg_rating FROM reviews WHERE property_id = ${propertyId}
    `;
    const newAvg = Number(avgData.rows[0].avg_rating) || rating;

    await sql`
      UPDATE properties
      SET rating = ${newAvg}
      WHERE id = ${propertyId}
    `;

    revalidatePath(`/alojamientos/${propertyId}`);
    revalidatePath('/');
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create review.');
  }
}

export async function registerUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = (formData.get('role') as string) || 'guest';

  if (!name || !email || !password) {
    return { error: 'Por favor completa todos los campos obligatorios.' };
  }

  try {
    const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existingUser.rows.length > 0) {
      return { error: 'Este correo electrónico ya está registrado.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await sql`
      INSERT INTO users (name, email, password, role)
      VALUES (${name}, ${email}, ${hashedPassword}, ${role})
    `;

    return { success: true };
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return { error: 'Ocurrió un error al crear la cuenta. Inténtalo de nuevo.' };
  }
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error: any) {
    if (error?.type === 'CredentialsSignin' || error?.message?.includes('CredentialsSignin')) {
      return 'Credenciales inválidas. Verifica tu correo y contraseña.';
    }
    throw error;
  }
}



