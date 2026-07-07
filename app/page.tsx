'use client';

import { useState, useEffect, Suspense } from 'react';
import { CardInicio } from '@/app/ui/inicio/cards1';
import { getStoredProperties } from '@/app/lib/properties-store';
import { Property } from '@/app/lib/properties-data';
import Search from '@/app/ui/search';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { useSearchParams } from 'next/navigation';

function PageContent() {
  const searchParams = useSearchParams();
  const query = searchParams ? searchParams.get('query') || '' : '';
  const [properties, setProperties] = useState<Property[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setProperties(getStoredProperties());
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-slate-200 rounded-3xl h-48 sm:h-52 w-full" />
        <div className="bg-slate-200 rounded-2xl h-14 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-slate-200 rounded-3xl aspect-[4/3] w-full" />
          ))}
        </div>
      </div>
    );
  }

  const filteredProperties = properties.filter((property) => {
    if (!query) return true;
    const term = query.toLowerCase();
    return (
      property.name.toLowerCase().includes(term) ||
      property.location.toLowerCase().includes(term) ||
      property.description.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md">
        <div className="absolute right-0 bottom-0 opacity-10 translate-y-12 translate-x-12 w-64 h-64 bg-emerald-400 rounded-full blur-3xl" />
        <div className="absolute left-1/3 top-0 opacity-10 -translate-y-12 w-48 h-48 bg-teal-400 rounded-full blur-2xl" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400">
            <SparklesIcon className="w-4 h-4" />
            <span>Destino Santa Marta</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Descubre alojamientos únicos cerca del mar
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
            Encuentra cabañas rústicas, penthouses modernos y habitaciones acogedoras en los mejores sectores de la bahía y la Sierra Nevada.
          </p>
        </div>
      </div>

      <div className="bg-white/80 border border-slate-100 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full">
          <Search placeholder="Buscar por nombre, ubicación o características..." />
        </div>
        <div className="text-xs text-slate-500 font-semibold shrink-0">
          Mostrando <span className="text-slate-800 font-bold">{filteredProperties.length}</span> de <span className="text-slate-800 font-bold">{properties.length}</span> alojamientos
        </div>
      </div>

      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <CardInicio key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="bg-white/80 border border-slate-100 rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
          <p className="text-slate-400 text-sm">No encontramos alojamientos que coincidan con tu búsqueda.</p>
          <p className="text-xs text-slate-400">Intenta buscando términos diferentes como "Minca", "Vista al Mar" o "Piscina".</p>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="space-y-6 animate-pulse">
        <div className="bg-slate-200 rounded-3xl h-48 sm:h-52 w-full" />
        <div className="bg-slate-200 rounded-2xl h-14 w-full" />
      </div>
    }>
      <PageContent />
    </Suspense>
  );
}
