import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next';
import SideNav from "@/app/ui/inicio/sidenav";


export const metadata: Metadata = {
  // El '%s' contenido de la plantilla se reemplazará por el título de la página especificada en cada página.,
  title: {
    template: '%s |Acme Dashboard',
    default: 'Acme Dashboard',
  },
  description: 'The oficial Next.js Course Dashboard, build with App Router',
  metadataBase: new URL('https://acme-dashboard.vercel.app'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
        <div className="w-full flex-none md:w-64">
          <SideNav />
        </div>,
        <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
          {children}
        </div>
      </div>
    </html>
  );
}








