import { fetchHostProperties, fetchHostStats } from '@/app/lib/data';
import DashboardClient from './dashboard-client';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function HostDashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const hostId = (session.user as any).id;

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
