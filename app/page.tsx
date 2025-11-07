import { CardInicio } from '@/app/ui/inicio/cards';
// import AcmeLogo from '@/app/ui/acme-logo';
// import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
// import styles from '@/app/ui/home.module.css';
// import { lusitana } from './ui/fonts';
// import { LayoutRouter } from 'next/dist/server/app-render/entry-base';
import React from 'react'; // Import React

export default function Page() {
  return (
    // <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
      <div >
        <h1>Santa Marta: 30 alojamientos</h1>
      {/* </div> */}
      <div>
        <CardInicio
          title="Cabaña SantaMarta"
          description="Hermosa cabaña cerca al mar y de fondo las hermosas montañas..."
          image="/cabana/cabana.png"
        />

      </div>
    </div>
  );
}
