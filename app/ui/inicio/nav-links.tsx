'use client';

import {
  HomeIcon,
  BuildingStorefrontIcon,
  BuildingOfficeIcon,
  BuildingLibraryIcon,
  InboxIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { name: 'Ver Todos', href: '/', icon: Squares2X2Icon },
  { name: 'Cabañas', href: '/Cabanas', icon: BuildingStorefrontIcon },
  { name: 'Casas', href: '/Casas', icon: HomeIcon },
  { name: 'Apartamentos', href: '/Apartamentos', icon: BuildingOfficeIcon },
  { name: 'Fincas', href: '/Fincas', icon: BuildingLibraryIcon },
  { name: 'Habitaciones', href: '/Habitaciones', icon: InboxIcon },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ease-in-out whitespace-nowrap",
              {
                "bg-emerald-550/10 text-emerald-700 bg-emerald-50 border border-emerald-100 shadow-sm shadow-emerald-50/50 scale-[1.02]": isActive,
                "text-slate-600 hover:text-emerald-600 hover:bg-slate-50 border border-transparent": !isActive,
              }
            )}
          >
            <LinkIcon className={clsx("w-5 h-5 shrink-0 transition-colors", {
              "text-emerald-550 text-emerald-600": isActive,
              "text-slate-400 group-hover:text-emerald-500": !isActive
            })} />
            <span>{link.name}</span>
          </Link>
        );
      })}
    </>
  );
}
