'use client';

import { useState, useEffect, Suspense } from 'react';
import { CardInicio } from '@/app/ui/inicio/cards1';
import { getStoredProperties } from '@/app/lib/properties-store';
import { Property } from '@/app/lib/properties-data';
import Search from '@/app/ui/search';
import { useSearchParams } from 'next/navigation';

function HabitacionesPageContent() {
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
        <div className="bg-slate-200 rounded-2xl h-14 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-200 rounded-3xl aspect-[4/3] w-full" />
          ))}
        </div>
      </div>
    );
  }

  const filteredProperties = properties.filter((property) => {
    if (property.category !== 'Habitaciones') return false;
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
      <div className="border-b border-slate-100 pb-4">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Habitaciones</h1>
        <p className="text-xs text-slate-500 mt-1">Eco-habitaciones y suites ejecutivas independientes a pocos pasos de la playa o inmersas en la selva.</p>
      </div>

      <div className="bg-white/80 border border-slate-100 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full">
          <Search placeholder="Buscar dentro de habitaciones..." />
        </div>
        <div className="text-xs text-slate-500 font-semibold shrink-0">
          Encontradas: <span className="text-slate-800 font-bold">{filteredProperties.length}</span> habitaciones
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
          <p className="text-slate-400 text-sm">No encontramos habitaciones que coincidan con tu búsqueda.</p>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="space-y-6 animate-pulse">
        <div className="bg-slate-200 rounded-2xl h-14 w-full" />
      </div>
    }>
      <HabitacionesPageContent />
    </Suspense>
  );
}