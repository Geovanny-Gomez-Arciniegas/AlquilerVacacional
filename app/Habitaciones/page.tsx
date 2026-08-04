import { Suspense } from 'react';
import { CardInicio } from '@/app/ui/inicio/cards1';
import { fetchFilteredProperties } from '@/app/lib/data';
import SearchFilters from '@/app/ui/search-filters';
import { PropertyFilters } from '@/app/lib/definitions';

async function HabitacionesPageContent({
  filters,
  currentPage,
}: {
  filters: PropertyFilters;
  currentPage: number;
}) {
  const properties = await fetchFilteredProperties({ ...filters, category: 'Habitación' }, currentPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 pb-4">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Habitaciones</h1>
        <p className="text-xs text-slate-500 mt-1">Eco-habitaciones y suites ejecutivas independientes a pocos pasos de la playa o inmersas en la selva.</p>
      </div>

      <SearchFilters />

      <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-semibold">
        <span>Habitaciones disponibles:</span>
        <span><strong className="text-slate-800 font-bold">{properties.length}</strong> habitaciones</span>
      </div>

      {properties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <CardInicio key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="bg-white/80 border border-slate-100 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
          <p className="text-slate-500 text-sm font-bold">No encontramos habitaciones que coincidan con tu búsqueda.</p>
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
          <div className="bg-slate-200 rounded-2xl h-14 w-full" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-200 rounded-3xl aspect-[4/3] w-full" />
            ))}
          </div>
        </div>
      }
    >
      <HabitacionesPageContent filters={filters} currentPage={currentPage} />
    </Suspense>
  );
}