import { CardInicio } from '@/app/ui/inicio/cards1';
import { properties } from '@/app/lib/properties-data';
import Search from '@/app/ui/search';

interface PageProps {
  searchParams?: Promise<{
    query?: string;
  }>;
}

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';

  const filteredProperties = properties.filter((property) => {
    if (property.category !== 'Casas') return false;
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
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Casas</h1>
        <p className="text-xs text-slate-500 mt-1">Imponentes casas de playa y residencias coloniales de descanso.</p>
      </div>

      <div className="bg-white/80 border border-slate-100 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full">
          <Search placeholder="Buscar dentro de casas..." />
        </div>
        <div className="text-xs text-slate-500 font-semibold shrink-0">
          Encontradas: <span className="text-slate-800 font-bold">{filteredProperties.length}</span> casas
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
          <p className="text-slate-400 text-sm">No encontramos casas que coincidan con tu búsqueda.</p>
        </div>
      )}
    </div>
  );
}