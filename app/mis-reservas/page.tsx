import { fetchGuestBookings } from '@/app/lib/data';
import { sql } from '@vercel/postgres';
import GuestBookingsClient from './guest-bookings-client';

export default async function MisReservasPage() {
  // Obtenemos un usuario huésped de prueba de la base de datos
  const userResult = await sql`SELECT id FROM users WHERE role = 'guest' LIMIT 1`;
  const guestId = userResult.rows.length > 0 ? userResult.rows[0].id : 'e8b995cd-4567-4dc2-bccd-671e3db4a451';

  const bookings = await fetchGuestBookings(guestId);

  // Asegurar que las fechas en la lista de reservas sean strings serializables
  const safeBookings = bookings.map((b) => ({
    ...b,
    start_date: new Date(b.start_date).toISOString(),
    end_date: new Date(b.end_date).toISOString(),
    created_at: b.created_at ? new Date(b.created_at).toISOString() : new Date().toISOString(),
  }));

  return (
    <GuestBookingsClient bookings={safeBookings} />
  );
}
