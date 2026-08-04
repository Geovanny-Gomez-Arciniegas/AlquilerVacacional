import { Suspense } from 'react';
import { fetchFilteredProperties } from '@/app/lib/data';
import SearchFilters from '@/app/ui/search-filters';
import PropertyResultsView from '@/app/ui/inicio/property-results-view';
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
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400">
            <SparklesIcon className="w-4 h-4 shrink-0" />
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

      {/* Resultados de la Búsqueda (Grid / Mapa Interactivo) */}
      <PropertyResultsView properties={properties} />
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
