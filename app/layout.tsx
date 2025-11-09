import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next';
import SideNav from "@/app/ui/inicio/sidenav";
import Header from '@/app/ui/panel/header';

export const metadata: Metadata = {
  // El '%s' contenido de la plantilla se reemplazará por el título de la página especificada en cada página.,
  title: {
    template: '%s |Alquiler Vacacional',
    default: 'Alquiler Vacacional',
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
    <html className={`${inter.className} antialiased`} lang="es">
      <body>

        <header>
          <div style={{ objectPosition: "center" }}>
            <Header />
          </div>
        </header>
        <main className="flex flex-col p-2 items-center">
          <div className="flex-row flex w-screen md:flex-row md:overflow-hidden">
            <div className="basis-[10%] w-full flex-none md:w-48">
              <SideNav />
            </div>
            <div className="basis-[90%] grow p-1 md:overflow-y-auto md:p-2">
              {children}
            </div>
          </div>
        </main>




        {/* <main className="flex flex-col p-2 items-center">
          <div className="flex-row flex w-screen md:flex-row md:overflow-hidden">
            <div className="basis-1/5 w-full flex-none md:w-64">
              <SideNav />
            </div>
            <div className="basis-4/5 grow p-1 md:overflow-y-auto md:p-2">
              {children}
            </div>
          </div>
        </main> */}
      </body>

    </html>
  );
}








