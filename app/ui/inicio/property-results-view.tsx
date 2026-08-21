'use client';

import { useState } from 'react';
import { PropertyWithPrimaryImage } from '@/app/lib/definitions';
import { CardInicio } from '@/app/ui/inicio/cards';
import ExplorationMap from '@/app/ui/map/exploration-map';
import { Squares2X2Icon, MapIcon } from '@heroicons/react/24/outline';

interface PropertyResultsViewProps {
  properties: PropertyWithPrimaryImage[];
  isLoggedIn?: boolean;
}

export default function PropertyResultsView({ properties, isLoggedIn = false }: PropertyResultsViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  return (
    <div className="space-y-6">
      
      {/* Barra de estado y alternancia de vista (Lista / Mapa) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="text-xs text-slate-500 font-semibold">
          <span>Resultados de la búsqueda: </span>
          <span className="text-slate-900 font-bold">{properties.length}</span>{' '}
          {properties.length === 1 ? 'alojamiento encontrado' : 'alojamientos encontrados'}
        </div>

        {/* Botón Flotante / Selector de Vista */}
        <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Squares2X2Icon className="w-4 h-4 text-emerald-600" />
            <span>Lista</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'map'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-4 h-4 text-emerald-600" />
            <span>Ver en Mapa</span>
          </button>
        </div>
      </div>

      {/* Renderizado de Vista elegida */}
      {properties.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <CardInicio key={property.id} property={property} isLoggedIn={isLoggedIn} />
            ))}
          </div>
        ) : (
          <ExplorationMap properties={properties} />
        )
      ) : (
        <div className="bg-white/80 border border-slate-100 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3 shadow-sm">
          <p className="text-slate-600 text-sm font-bold">No encontramos alojamientos que coincidan con tu búsqueda.</p>
          <p className="text-xs text-slate-400">Intenta ajustando los filtros de precio, fechas o comodidades seleccionadas.</p>
        </div>
      )}

    </div>
  );
}
