'use client';

import { useState } from 'react';
import { MapPinIcon, MapIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { getCoordinatesForLocation } from '@/app/lib/geolocation';

interface PropertyMapProps {
  title: string;
  city: string;
  propertyId: string;
}

export default function PropertyMap({ title, city, propertyId }: PropertyMapProps) {
  const coords = getCoordinatesForLocation(city, propertyId);
  const [isInteractive, setIsInteractive] = useState(true);

  // URL para Google Maps Embed (con o sin API Key)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const embedUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${coords.lat},${coords.lng}&zoom=14`
    : `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=14&output=embed`;

  const directGoogleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
            <MapIcon className="w-4 h-4" />
            <span>Ubicación y Entorno</span>
          </div>
          <h3 className="text-lg font-extrabold text-slate-800">{city}, Colombia</h3>
          <p className="text-xs text-slate-400 mt-0.5">La ubicación exacta se proporciona después de confirmar la reserva.</p>
        </div>

        <a
          href={directGoogleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
        >
          <span>Abrir en Google Maps</span>
          <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Contenedor del Mapa */}
      <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-200/80 shadow-inner bg-slate-100 group">
        
        <iframe
          title={`Mapa de ${title}`}
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
        />

        {/* Marcador Flotante Personalizado */}
        <div className="absolute top-4 left-4 bg-slate-900/90 text-white p-3 rounded-2xl backdrop-blur-md shadow-lg border border-slate-700/50 flex items-center gap-3 pointer-events-none">
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm">
            <MapPinIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white line-clamp-1">{title}</p>
            <p className="text-[10px] text-emerald-400 font-semibold">{city}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
