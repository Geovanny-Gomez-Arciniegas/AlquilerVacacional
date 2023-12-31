import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next';

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
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
