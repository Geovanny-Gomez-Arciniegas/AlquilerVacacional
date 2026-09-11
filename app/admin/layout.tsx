import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Panel de Administrador | EcoBooking',
  description: 'Gestión global de alojamientos en EcoBooking.',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  const role = (session.user as any).role;
  if (role !== 'admin') {
    redirect('/'); // Redirigir a inicio si no es admin
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col text-slate-800 antialiased">
      {/* Header del Panel de Administrador */}
      <header className="sticky top-0 z-40 w-full bg-slate-900 border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo del Administrador */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-rose-500 to-red-600 p-2 rounded-xl text-slate-950 shadow-sm shadow-red-500/20 font-black">
                🛡️
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-white leading-none">
                  EcoBooking
                </span>
                <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider mt-0.5">
                  Panel de Administrador
                </span>
              </div>
            </div>

            {/* Acciones del Header */}
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 bg-slate-800 text-slate-300 rounded-full border border-slate-700">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                Modo Admin Activo
              </span>
              <a
                href="/"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold tracking-wide uppercase rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-600 transition-all cursor-pointer"
              >
                ← Volver al Sitio
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
        {children}
      </main>
    </div>
  );
}
