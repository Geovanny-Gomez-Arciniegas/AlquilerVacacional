import { CardInicio } from '@/app/ui/inicio/cards1';


// import Pagination from '@/app/ui/invoices/pagination';
// import Search from '@/app/ui/search';
// import Table from '@/app/ui/invoices/table';
// import { CreateInvoice } from '@/app/ui/invoices/buttons';
// import { lusitana } from '@/app/ui/fonts';
// import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
// import { Suspense } from 'react';
// import { fetchInvoicesPages } from '@/app/lib/data';
//Para cambiar los metadatos de el título de la página y la descripción
// import { Metadata } from 'next';
// import AcmeLogo from '@/app/ui/acme-logo';
// import { ArrowRightIcon } from '@heroicons/react/24/outline';
// import Link from 'next/link';
// import styles from '@/app/ui/home.module.css';
// import { lusitana } from './ui/fonts';
// import { LayoutRouter } from 'next/dist/server/app-render/entry-base';
// import React from 'react'; // Import React

export default function Page() {
  return (
    <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
      <div >
        <h1>Santa Marta: 30 alojamientos</h1>
      </div>
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
