'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  SparklesIcon, 
  UserCircleIcon,
  GlobeAmericasIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { logoutUser } from '@/app/lib/actions';

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
}

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();


  const isLoggedIn = !!user;
  const isHost = user?.role === 'host' || user?.role === 'admin';

  const handleHostClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isLoggedIn && !isHost) {
      e.preventDefault();
      alert('⚠️ No eres un anfitrión. El Modo Anfitrión requiere una cuenta con rol de Anfitrión.');
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y Nombre */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group shrink-0">
            <div className="bg-gradient-to-tr from-emerald-500 to-teal-500 p-1.5 sm:p-2 rounded-xl text-white shadow-md shadow-teal-100 group-hover:scale-105 transition-transform">
              <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-base sm:text-xl font-bold tracking-tight text-slate-800 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              EcoBooking <span className="hidden md:inline text-emerald-500 font-light">Santa Marta</span>
            </span>
          </Link>

          {/* Buscador / Ubicación Estilizado */}
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-slate-600 text-xs font-medium hover:bg-slate-100/70 transition-all cursor-pointer">
            <GlobeAmericasIcon className="w-4 h-4 text-emerald-500 animate-spin-slow" />
            <span>Explorando alojamientos en Santa Marta, CO</span>
          </div>

          {/* Menú de Acceso / Dashboard / Mis Reservas / Login / Salir */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {!isLoggedIn ? (
              <Link
                href="/login"
                className={clsx(
                  "flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-sm hover:border-slate-300 transition-all whitespace-nowrap",
                  {
                    "bg-slate-900 border-slate-900 text-white font-bold": pathname === '/login'
                  }
                )}
              >
                <UserCircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                <span>Ingresar</span>
              </Link>
            ) : (
              <form action={async () => { await logoutUser(); }}>
                <button
                  type="submit"
                  className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full border border-rose-200 text-rose-700 bg-rose-50/50 hover:bg-rose-100/60 shadow-sm transition-all whitespace-nowrap"
                >
                  <ArrowRightOnRectangleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </form>
            )}

            <Link
              href="/mis-reservas"
              className={clsx(
                "flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-sm hover:border-slate-300 transition-all whitespace-nowrap",
                {
                  "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold": pathname === '/mis-reservas'
                }
              )}
            >
              <span><span className="hidden sm:inline">Mis </span>Reservas</span>
            </Link>

            <Link
              href="/host"
              onClick={handleHostClick}
              className={clsx(
                "flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-full border border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/60 shadow-sm transition-all whitespace-nowrap",
                {
                  "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700": pathname === '/host'
                }
              )}
            >
              <span>🔑 <span className="hidden sm:inline">Modo </span>Anfitrión</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
