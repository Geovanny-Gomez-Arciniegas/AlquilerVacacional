import { fetchAllPropertiesForAdmin } from '@/app/lib/data';
import AdminDashboardClient from './admin-dashboard-client';

export default async function AdminDashboardPage() {
  const properties = await fetchAllPropertiesForAdmin();
  
  return <AdminDashboardClient properties={properties as any} />;
}
