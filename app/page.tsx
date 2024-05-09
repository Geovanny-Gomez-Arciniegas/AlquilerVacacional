import AcmeLogo from '@/app/ui/acme-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import styles from '@/app/ui/home.module.css';
import { lusitana } from './ui/fonts';
import { LayoutRouter } from 'next/dist/server/app-render/entry-base';
import React from 'react'; // Import React

export default function Page() {
  return (
    <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
      <div className="flex items-center justify-center p-2 md:w-4/5 md:px-28 md:py-2">
        <h1>Este es el segundo espacio</h1>
      </div>
    </div>
  );
}
