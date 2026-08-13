import { auth } from '@/auth';
import LayoutWrapperClient from '@/app/ui/panel/layout-wrapper-client';

export default async function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return <LayoutWrapperClient user={session?.user}>{children}</LayoutWrapperClient>;
}

