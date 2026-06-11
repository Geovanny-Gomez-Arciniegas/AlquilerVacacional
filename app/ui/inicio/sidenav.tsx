'use client';

import NavLinks from '@/app/ui/inicio/nav-links';
import { Squares2X2Icon } from '@heroicons/react/24/outline';

export default function SideNav() {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <Squares2X2Icon className="w-5 h-5 text-emerald-500" />
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Categorías
        </h2>
      </div>
      
      <div className="flex flex-row overflow-x-auto gap-2 md:flex-col md:overflow-visible pb-2 md:pb-0 scrollbar-none">
        <NavLinks />
      </div>
      
      <div className="hidden md:block mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
        <p>© 2026 EcoBooking CO.</p>
        <p className="mt-1">Santa Marta - Colombia</p>
      </div>
    </div>
  );
}
