'use client';

import { usePathname } from 'next/navigation';
import Header from '@/app/ui/panel/header';
import SideNav from '@/app/ui/inicio/sidenav';

interface LayoutWrapperClientProps {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
}

export default function LayoutWrapperClient({ children, user }: LayoutWrapperClientProps) {
  const pathname = usePathname() || '';
  const isAuthOrHost = pathname.startsWith('/login') || pathname.startsWith('/host');

  if (isAuthOrHost) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <Header user={user} />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar for Categories */}
          <aside className="w-full md:w-56 flex-none">
            <div className="sticky top-22">
              <SideNav />
            </div>
          </aside>
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
