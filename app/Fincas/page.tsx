import { Suspense } from 'react';
import { CardInicio } from '@/app/ui/inicio/cards1';
import { fetchFilteredProperties } from '@/app/lib/data';
import Search from '@/app/ui/search';

async function FincasPageContent({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const properties = await fetchFilteredProperties(query, currentPage, 'Finca');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 pb-4">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Fincas</h1>
        <p className="text-xs text-slate-500 mt-1">Fincas cafeteras, ecoturísticas y de recreo en Minca y las estribaciones de la Sierra Nevada.</p>
      </div>

      <div className="bg-white/80 border border-slate-100 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full">
          <Search placeholder="Buscar dentro de fincas..." />
        </div>
        <div className="text-xs text-slate-500 font-semibold shrink-0">
          Encontradas: <span className="text-slate-800 font-bold">{properties.length}</span> fincas
        </div>
      </div>

      {properties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <CardInicio key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="bg-white/80 border border-slate-100 rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
          <p className="text-slate-400 text-sm">No encontramos fincas que coincidan con tu búsqueda.</p>
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
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  return (
    <Suspense 
      key={query + currentPage}
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
      <FincasPageContent query={query} currentPage={currentPage} />
    </Suspense>
  );
}