'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PropertyWithPrimaryImage } from '@/app/lib/definitions';
import { getCoordinatesForLocation } from '@/app/lib/geolocation';
import { MapPinIcon, XMarkIcon, SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface ExplorationMapProps {
  properties: PropertyWithPrimaryImage[];
}

export default function ExplorationMap({ properties }: ExplorationMapProps) {
  const [selectedProperty, setSelectedProperty] = useState<PropertyWithPrimaryImage | null>(
    properties.length > 0 ? properties[0] : null
  );

  // Calcular centro del mapa promedio
  const centerLat = 11.2408;
  const centerLng = -74.199;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const embedUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=Santa+Marta+Colombia&zoom=12`
    : `https://maps.google.com/maps?q=${centerLat},${centerLng}&z=12&output=embed`;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* Contenedor Principal del Mapa */}
      <div className="relative w-full h-[600px] rounded-3xl overflow-hidden border border-slate-200 shadow-lg bg-slate-900">
        
        {/* Mapa Base iframe */}
        <iframe
          title="Mapa de Exploración de Alojamientos"
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          className="w-full h-full opacity-90"
        />

        {/* Capa de Marcadores de Precio Interactivos */}
        <div className="absolute inset-0 pointer-events-none p-6">
          
          {/* Header Flotante */}
          <div className="bg-slate-900/90 text-white px-4 py-2.5 rounded-2xl backdrop-blur-md border border-slate-800 shadow-md inline-flex items-center gap-2 pointer-events-auto">
            <SparklesIcon className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold">{properties.length} alojamientos en el mapa</span>
          </div>

          {/* Lista de Marcadores Flotantes Estilo Airbnb */}
          <div className="absolute inset-x-8 top-20 bottom-8 overflow-y-auto pointer-events-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 content-start pointer-events-none">
            {properties.map((prop) => {
              const isSelected = selectedProperty?.id === prop.id;
              return (
                <button
                  key={prop.id}
                  onClick={() => setSelectedProperty(prop)}
                  className={`pointer-events-auto text-left p-3 rounded-2xl transition-all shadow-md flex items-center justify-between gap-2 border cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-400 scale-105 shadow-xl ring-4 ring-emerald-500/30'
                      : 'bg-white/95 text-slate-800 hover:bg-white border-slate-200/90 hover:scale-102'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase truncate opacity-80">{prop.city}</p>
                    <p className="text-xs font-black truncate">{formatPrice(prop.price_per_night)}</p>
                  </div>
                  <MapPinIcon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
                </button>
              );
            })}
          </div>

        </div>

        {/* Tarjeta de Vista Previa Emergente del Alojamiento Seleccionado */}
        {selectedProperty && (
          <div className="absolute bottom-6 left-6 right-6 max-w-sm mx-auto bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-2xl border border-slate-100 flex gap-4 items-center animate-in slide-in-from-bottom-4 duration-200">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
              <img
                src={selectedProperty.image_url || '/placeholder.jpg'}
                alt={selectedProperty.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-md">
                {selectedProperty.category}
              </span>
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex justify-between items-start">
                <h4 className="text-xs font-extrabold text-slate-900 truncate pr-2">{selectedProperty.title}</h4>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-slate-500 font-medium">📍 {selectedProperty.city}</p>
              
              <div className="pt-1 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Noche</span>
                  <span className="text-xs font-black text-slate-900">{formatPrice(selectedProperty.price_per_night)}</span>
                </div>

                <Link
                  href={`/alojamientos/${selectedProperty.id}`}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold rounded-xl flex items-center gap-1 transition-all shadow-sm"
                >
                  <span>Ver</span>
                  <ArrowRightIcon className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
