const { db } = require('@vercel/postgres');
const {
  users,
  properties,
  images,
  bookings,
  reviews,
} = require('../app/lib/placeholder-data.js');
const bcrypt = require('bcryptjs');

async function seedUsers(client) {
  try {
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    // Crear tabla users
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log(`Created "users" table`);

    // Insertar datos
    const insertedUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return client.sql`
        INSERT INTO users (id, name, email, password, role)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword}, ${user.role})
        ON CONFLICT (id) DO NOTHING;
      `;
      }),
    );

    console.log(`Seeded ${insertedUsers.length} users`);
    return { createTable, users: insertedUsers };
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

async function seedProperties(client) {
  try {
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS properties (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        host_id UUID NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL,
        price_per_night DECIMAL(10, 2) NOT NULL,
        max_guests INT NOT NULL,
        category VARCHAR(100) NOT NULL,
        bedrooms INT NOT NULL,
        bathrooms INT NOT NULL,
        amenities TEXT[] NOT NULL,
        rating DECIMAL(3, 1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_host
          FOREIGN KEY(host_id) 
          REFERENCES users(id)
          ON DELETE CASCADE
      );
    `;

    console.log(`Created "properties" table`);

    const insertedProperties = await Promise.all(
      properties.map(
        (prop) => client.sql`
        INSERT INTO properties (id, host_id, title, description, city, country, price_per_night, max_guests, category, bedrooms, bathrooms, amenities, rating)
        VALUES (${prop.id}, ${prop.host_id}, ${prop.title}, ${prop.description}, ${prop.city}, ${prop.country}, ${prop.price_per_night}, ${prop.max_guests}, ${prop.category}, ${prop.bedrooms}, ${prop.bathrooms}, ${prop.amenities}, ${prop.rating})
        ON CONFLICT (id) DO NOTHING;
      `,
      ),
    );

    console.log(`Seeded ${insertedProperties.length} properties`);
    return { createTable, properties: insertedProperties };
  } catch (error) {
    console.error('Error seeding properties:', error);
    throw error;
  }
}

async function seedImages(client) {
  try {
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS images (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        property_id UUID NOT NULL,
        url VARCHAR(500) NOT NULL,
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_property
          FOREIGN KEY(property_id) 
          REFERENCES properties(id)
          ON DELETE CASCADE
      );
    `;

    console.log(`Created "images" table`);

    const insertedImages = await Promise.all(
      images.map(
        (img) => client.sql`
        INSERT INTO images (id, property_id, url, is_primary)
        VALUES (${img.id}, ${img.property_id}, ${img.url}, ${img.is_primary})
        ON CONFLICT (id) DO NOTHING;
      `,
      ),
    );

    console.log(`Seeded ${insertedImages.length} images`);
    return { createTable, images: insertedImages };
  } catch (error) {
    console.error('Error seeding images:', error);
    throw error;
  }
}

async function seedBookings(client) {
  try {
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS bookings (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        property_id UUID NOT NULL,
        guest_id UUID NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_property_booking
          FOREIGN KEY(property_id) 
          REFERENCES properties(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_guest_booking
          FOREIGN KEY(guest_id) 
          REFERENCES users(id)
          ON DELETE CASCADE
      );
    `;

    console.log(`Created "bookings" table`);

    const insertedBookings = await Promise.all(
      bookings.map(
        (b) => client.sql`
        INSERT INTO bookings (id, property_id, guest_id, start_date, end_date, total_price, status)
        VALUES (${b.id}, ${b.property_id}, ${b.guest_id}, ${b.start_date}, ${b.end_date}, ${b.total_price}, ${b.status})
        ON CONFLICT (id) DO NOTHING;
      `,
      ),
    );

    console.log(`Seeded ${insertedBookings.length} bookings`);
    return { createTable, bookings: insertedBookings };
  } catch (error) {
    console.error('Error seeding bookings:', error);
    throw error;
  }
}

async function seedReviews(client) {
  try {
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        property_id UUID NOT NULL,
        guest_id UUID NOT NULL,
        rating INT NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_property_review
          FOREIGN KEY(property_id) 
          REFERENCES properties(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_guest_review
          FOREIGN KEY(guest_id) 
          REFERENCES users(id)
          ON DELETE CASCADE
      );
    `;

    console.log(`Created "reviews" table`);

    const insertedReviews = await Promise.all(
      reviews.map(
        (r) => client.sql`
        INSERT INTO reviews (id, property_id, guest_id, rating, comment)
        VALUES (${r.id}, ${r.property_id}, ${r.guest_id}, ${r.rating}, ${r.comment})
        ON CONFLICT (id) DO NOTHING;
      `,
      ),
    );

    console.log(`Seeded ${insertedReviews.length} reviews`);
    return { createTable, reviews: insertedReviews };
  } catch (error) {
    console.error('Error seeding reviews:', error);
    throw error;
  }
}

async function main() {
  const client = await db.connect();

  console.log('Borrando tablas antiguas para reiniciar la base de datos...');
  await client.sql`DROP TABLE IF EXISTS reviews, bookings, images, properties, users, customers, invoices, revenue CASCADE;`;
  console.log('Tablas antiguas borradas.');

  await seedUsers(client);
  await seedProperties(client);
  await seedImages(client);
  await seedBookings(client);
  await seedReviews(client);

  // Crear índices para optimizar búsquedas (ciudades, precios, fechas)
  await client.sql`CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);`;
  await client.sql`CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price_per_night);`;
  await client.sql`CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);`;

  console.log('Índices de base de datos creados correctamente.');

  await client.end();
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to seed the database:',
    err,
  );
});
