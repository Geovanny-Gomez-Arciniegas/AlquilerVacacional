'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { SparklesIcon, XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

function WelcomeBannerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isWelcome = searchParams.get('welcome') === '1';
  const isRegistered = searchParams.get('registered') === '1';
  const isUnauthorizedHost = searchParams.get('error') === 'UnauthorizedHost';

  const [visible, setVisible] = useState(false);
  const [type, setType] = useState<'welcome' | 'registered' | 'unauthorized' | null>(null);

  const handleDismiss = () => {
    setVisible(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('welcome');
    params.delete('registered');
    params.delete('error');
    router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  };

  useEffect(() => {
    if (isWelcome) {
      setType('welcome');
      setVisible(true);
    } else if (isRegistered) {
      setType('registered');
      setVisible(true);
    } else if (isUnauthorizedHost) {
      setType('unauthorized');
      setVisible(true);
    }
  }, [isWelcome, isRegistered, isUnauthorizedHost]);

  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, 40000);

    return () => clearTimeout(timer);
  }, [visible, searchParams, pathname]);

  if (!visible || !type) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 animate-in slide-in-from-top duration-300">
      {type === 'welcome' && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between gap-3 border border-emerald-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md shrink-0">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-emerald-200">¡Inicio de sesión exitoso!</p>
              <p className="text-sm font-bold">¡Bienvenido de nuevo a EcoBooking Santa Marta!</p>
            </div>
          </div>
          <button onClick={handleDismiss} className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {type === 'registered' && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-emerald-700">¡Registro Exitoso!</p>
              <p className="text-sm font-bold text-emerald-950">Tu cuenta se ha creado correctamente. Ya puedes iniciar sesión.</p>
            </div>
          </div>
          <button onClick={handleDismiss} className="p-1 rounded-lg hover:bg-emerald-100 text-emerald-700 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {type === 'unauthorized' && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-amber-700">Acceso Restringido</p>
              <p className="text-sm font-bold text-amber-950">
                El Modo Anfitrión (`/host`) requiere una cuenta registrada como <strong>Anfitrión</strong>.
              </p>
            </div>
          </div>
          <button onClick={handleDismiss} className="p-1 rounded-lg hover:bg-amber-100 text-amber-700 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function WelcomeBanner() {
  return (
    <Suspense fallback={null}>
      <WelcomeBannerContent />
    </Suspense>
  );
}
