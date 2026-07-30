import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next';
import LayoutWrapper from '@/app/ui/panel/layout-wrapper';

export const metadata: Metadata = {
  title: {
    template: '%s | EcoBooking',
    default: 'EcoBooking Santa Marta - Alquiler Vacacional',
  },
  description: 'Reserva los mejores apartamentos, cabañas y casas vacacionales en Santa Marta.',
  metadataBase: new URL('https://acme-dashboard.vercel.app'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={`${inter.className} antialiased`} lang="es">
      <body className="bg-slate-50 text-slate-900">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}









