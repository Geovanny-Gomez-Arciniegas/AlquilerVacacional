import LoginForm from '@/app/ui/login-form';
import Link from 'next/link';
import { SparklesIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
      
      {/* Luces decorativas de fondo (Glow effects) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Superior */}
      <div className="max-w-7xl w-full mx-auto flex justify-between items-center z-10">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-emerald-500 p-2 rounded-xl text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <SparklesIcon className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            EcoBooking <span className="text-emerald-400 font-light">Santa Marta</span>
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center text-xs font-semibold text-slate-300 hover:text-white transition-colors bg-white/10 hover:bg-white/15 px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/10"
        >
          <ChevronLeftIcon className="w-3.5 h-3.5 mr-1" />
          Volver a inicio
        </Link>
      </div>

      {/* Contenido Central */}
      <div className="my-auto py-8 z-10 w-full">
        <LoginForm />
      </div>

      {/* Footer */}
      <div className="max-w-7xl w-full mx-auto text-center text-xs text-slate-500 z-10">
        EcoBooking Santa Marta © {new Date().getFullYear()} — Plataforma de Alquiler Vacacional Sostenible.
      </div>
    </main>
  );
}
