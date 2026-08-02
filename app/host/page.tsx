import { fetchHostProperties, fetchHostStats } from '@/app/lib/data';
import DashboardClient from './dashboard-client';
import { sql } from '@vercel/postgres';

export default async function HostDashboardPage() {
  // Obtenemos un anfitrión de prueba de la base de datos
  const userResult = await sql`SELECT id FROM users WHERE role = 'host' LIMIT 1`;
  const hostId = userResult.rows.length > 0 ? userResult.rows[0].id : 'd2c884bd-3453-4dc2-bccd-671e3db4a450';

  const properties = await fetchHostProperties(hostId);
  const stats = await fetchHostStats(hostId);

  const safeStats = {
    ...stats,
    bookingsList: stats.bookingsList.map((b: any) => ({
      id: String(b.id),
      property_title: String(b.property_title),
      guest_name: String(b.guest_name),
      start_date: new Date(b.start_date).toISOString(),
      end_date: new Date(b.end_date).toISOString(),
      total_price: Number(b.total_price),
      status: String(b.status),
    })),
  };

  return (
    <DashboardClient properties={properties} stats={safeStats} hostId={hostId} />
  );
}
