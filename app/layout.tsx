import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next';
import LayoutWrapper from '@/app/ui/panel/layout-wrapper';
import WelcomeBanner from '@/app/ui/welcome-banner';

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
}: { children: React.ReactNode }) {
  return (
    <html className={`${inter.className} antialiased`} lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 relative transition-colors duration-200">
        <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none">
          <div className="pointer-events-auto">
            <WelcomeBanner />
          </div>
        </div>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
