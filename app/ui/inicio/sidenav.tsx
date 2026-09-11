'use client';

import Link from 'next/link';
import NavLinks from '@/app/ui/inicio/nav-links';
import { Squares2X2Icon, ArrowRightOnRectangleIcon, ArrowLeftOnRectangleIcon, ShieldCheckIcon, HomeModernIcon, UserIcon } from '@heroicons/react/24/outline';
import { logoutUser } from '@/app/lib/actions';

interface SideNavProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
}

export default function SideNav({ user }: SideNavProps) {
  const isLoggedIn = !!user;

  // Formato y estilos para el badge de rol
  const getRoleBadge = (role?: string | null) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Admin',
          bg: 'bg-purple-100 text-purple-700 border-purple-200',
          icon: ShieldCheckIcon,
        };
      case 'host':
        return {
          label: 'Anfitrión',
          bg: 'bg-teal-100 text-teal-700 border-teal-200',
          icon: HomeModernIcon,
        };
      default:
        return {
          label: 'Huésped',
          bg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          icon: UserIcon,
        };
    }
  };

  const roleInfo = getRoleBadge(user?.role);
  const RoleIcon = roleInfo.icon;

  // Obtener iniciales del usuario
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : (user?.email?.[0] || 'U').toUpperCase();

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col gap-4">
      {/* Sección Superior: Categorías */}
      <div>
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
          <Squares2X2Icon className="w-5 h-5 text-emerald-500" />
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Categorías
          </h2>
        </div>
        
        <div className="flex flex-row overflow-x-auto gap-2 md:flex-col md:overflow-visible pb-2 md:pb-0 scrollbar-none">
          <NavLinks />
        </div>
      </div>

      {/* Sección Inferior: Usuario Activo (Desktop y Mobile) */}
      <div className="pt-3 border-t border-slate-100">
        {isLoggedIn ? (
          <div className="bg-slate-50 border border-slate-100/80 rounded-xl p-3 flex flex-col gap-2.5 transition-all">
            <div className="flex items-center gap-2.5">
              {/* Avatar con Iniciales */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
                {initials}
              </div>

              {/* Datos de Usuario */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-slate-800 truncate" title={user?.name || 'Usuario'}>
                    {user?.name || 'Usuario'}
                  </p>
                </div>
                <p className="text-[11px] text-slate-500 truncate" title={user?.email || ''}>
                  {user?.email || ''}
                </p>
              </div>
            </div>

            {/* Badge de Rol y Botón de Salir */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleInfo.bg}`}>
                <RoleIcon className="w-3 h-3" />
                {roleInfo.label}
              </span>

              <form action={logoutUser}>
                <button
                  type="submit"
                  title="Cerrar sesión"
                  className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-600 transition-colors py-0.5 px-1.5 rounded-md hover:bg-rose-50"
                >
                  <ArrowRightOnRectangleIcon className="w-3.5 h-3.5" />
                  <span>Salir</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
            <p className="text-xs text-slate-600 mb-2">No has iniciado sesión</p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="w-3.5 h-3.5" />
              <span>Iniciar sesión</span>
            </Link>
          </div>
        )}

        {/* Footer info */}
        <div className="hidden md:block mt-3 text-[10px] text-slate-400 text-center">
          <p>© 2026 EcoBooking CO.</p>
        </div>
      </div>
    </div>
  );
}

