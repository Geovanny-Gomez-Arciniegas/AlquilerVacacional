import { Suspense } from 'react';
import { CardInicio } from '@/app/ui/inicio/cards1';
import { fetchFilteredProperties } from '@/app/lib/data';
import SearchFilters from '@/app/ui/search-filters';
import { PropertyFilters } from '@/app/lib/definitions';
import { SparklesIcon } from '@heroicons/react/24/outline';

async function PageContent({
  filters,
  currentPage,
}: {
  filters: PropertyFilters;
  currentPage: number;
}) {
  const properties = await fetchFilteredProperties(filters, currentPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Banner de Bienvenida */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md">
        <div className="absolute right-0 bottom-0 opacity-10 translate-y-12 translate-x-12 w-64 h-64 bg-emerald-400 rounded-full blur-3xl" />
        <div className="absolute left-1/3 top-0 opacity-10 -translate-y-12 w-48 h-48 bg-teal-400 rounded-full blur-2xl" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400">
            <SparklesIcon className="w-4 h-4" />
            <span>Destino Ideal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Descubre alojamientos únicos para tu próxima escapada
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
            Encuentra cabañas rústicas, apartamentos modernos y habitaciones acogedoras en los mejores destinos.
          </p>
        </div>
      </div>

      {/* Componente de Búsqueda y Filtros Avanzados */}
      <SearchFilters />

      {/* Resultados de la Búsqueda */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-semibold">
        <span>Resultados de la búsqueda:</span>
        <span><strong className="text-slate-800 font-bold">{properties.length}</strong> {properties.length === 1 ? 'alojamiento encontrado' : 'alojamientos encontrados'}</span>
      </div>

      {properties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <CardInicio key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="bg-white/80 border border-slate-100 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3 shadow-sm">
          <p className="text-slate-600 text-sm font-bold">No encontramos alojamientos que coincidan con tu búsqueda.</p>
          <p className="text-xs text-slate-400">Intenta ajustando los filtros de precio, fechas o comodidades seleccionadas.</p>
        </div>
      )}
    </div>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
    guests?: string;
    bedrooms?: string;
    bathrooms?: string;
    amenities?: string;
    startDate?: string;
    endDate?: string;
  };
}) {
  const currentPage = Number(searchParams?.page) || 1;

  const filters: PropertyFilters = {
    query: searchParams?.query || '',
    minPrice: searchParams?.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams?.maxPrice ? Number(searchParams.maxPrice) : undefined,
    guests: searchParams?.guests ? Number(searchParams.guests) : undefined,
    bedrooms: searchParams?.bedrooms ? Number(searchParams.bedrooms) : undefined,
    bathrooms: searchParams?.bathrooms ? Number(searchParams.bathrooms) : undefined,
    amenities: searchParams?.amenities ? searchParams.amenities.split(',') : undefined,
    startDate: searchParams?.startDate || '',
    endDate: searchParams?.endDate || '',
  };

  const keyString = JSON.stringify(searchParams || {});

  return (
    <Suspense 
      key={keyString} 
      fallback={
        <div className="space-y-6 animate-pulse">
          <div className="bg-slate-200 rounded-3xl h-48 sm:h-52 w-full" />
          <div className="bg-slate-200 rounded-2xl h-14 w-full" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-slate-200 rounded-3xl aspect-[4/3] w-full" />
            ))}
          </div>
        </div>
      }
    >
      <PageContent filters={filters} currentPage={currentPage} />
    </Suspense>
  );
}
