'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  SparklesIcon, 
  UserCircleIcon,
  GlobeAmericasIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function Header() {
  const pathname = usePathname();

  // No mostramos este header global dentro de las rutas del panel de control
  // ya que el dashboard tiene su propio layout de admin.
  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y Nombre */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-tr from-emerald-500 to-teal-500 p-2 rounded-xl text-white shadow-md shadow-teal-100 group-hover:scale-105 transition-transform">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              EcoBooking <span className="text-emerald-500 font-light">Santa Marta</span>
            </span>
          </Link>

          {/* Buscador / Ubicación Estilizado */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-slate-600 text-xs font-medium hover:bg-slate-100/70 transition-all cursor-pointer">
            <GlobeAmericasIcon className="w-4 h-4 text-emerald-500 animate-spin-slow" />
            <span>Explorando alojamientos en Santa Marta, CO</span>
          </div>

          {/* Menú de Acceso / Dashboard */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className={clsx(
                "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-sm hover:border-slate-300 transition-all",
                {
                  "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/50": pathname === '/dashboard'
                }
              )}
            >
              <UserCircleIcon className="w-5 h-5 text-slate-500" />
              <span>Mi Cuenta</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}