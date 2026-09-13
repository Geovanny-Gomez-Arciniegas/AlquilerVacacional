'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PropertyWithPrimaryImage } from '@/app/lib/definitions';
import BookingModal from '@/app/ui/inicio/booking-modal';
import { 
  StarIcon, 
  MapPinIcon, 
  UsersIcon,
} from '@heroicons/react/24/solid';

interface CardInicioProps {
  property: PropertyWithPrimaryImage;
  isLoggedIn?: boolean;
}

export function CardInicio({ property, isLoggedIn = false }: CardInicioProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const amenities = property.amenities || [];

  return (
    <>
      <div className="group bg-white rounded-3xl overflow-hidden border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-[3px] transition-all duration-350 flex flex-col h-full">
        
        {/* Imagen del Alojamiento */}
        <Link href={`/alojamientos/${property.id}`} className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100 block group/img">
          {property.image_url ? (
            <img
              src={property.image_url}
              alt={property.title}
              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
              Sin Imagen
            </div>
          )}

          {/* Categoría Badge */}
          <div className="absolute top-3.5 left-3.5 z-10">
            <span className="bg-white/90 backdrop-blur-md text-emerald-800 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-sm border border-white/50">
              {property.category}
            </span>
          </div>

          {/* Calificación Badge */}
          {property.rating && (
            <div className="absolute top-3.5 right-3.5 z-10">
              <div className="bg-slate-900/80 backdrop-blur-md text-white font-extrabold text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border border-slate-700/50">
                <StarIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>{Number(property.rating).toFixed(1)}</span>
              </div>
            </div>
          )}
        </Link>

        {/* Detalles del Alojamiento */}
        <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
          <div className="space-y-2">
            {/* Ubicación */}
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
              <MapPinIcon className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="line-clamp-1">{property.city}, {property.country}</span>
            </div>

            {/* Título */}
            <Link href={`/alojamientos/${property.id}`}>
              <h3 className="text-base font-extrabold text-slate-800 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                {property.title}
              </h3>
            </Link>

            {/* Capacidad y Distribución */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1 font-medium">
              <div className="flex items-center gap-1">
                <UsersIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>{property.max_guests} huésp.</span>
              </div>
              <span>•</span>
              <span>{property.bedrooms} hab</span>
              <span>•</span>
              <span>{property.bathrooms} baños</span>
            </div>

            {/* Comodidades destacadas */}
            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {amenities.slice(0, 3).map((amenity, idx) => (
                  <span 
                    key={idx} 
                    className="bg-slate-100/80 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                  >
                    {amenity}
                  </span>
                ))}
                {amenities.length > 3 && (
                  <span className="text-[10px] text-slate-400 font-semibold align-self-center">
                    +{amenities.length - 3} más
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Precio y Acción */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Precio noche
              </span>
              <span className="text-lg font-extrabold text-slate-800 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                {formatPrice(property.price_per_night)}
              </span>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs tracking-wide uppercase rounded-xl shadow-md hover:shadow-lg shadow-emerald-50 hover:shadow-emerald-100 transition-all hover:-translate-y-[1px] active:translate-y-0 cursor-pointer"
            >
              Reservar
            </button>
          </div>
        </div>
      </div>

      {/* Modal interactivo */}
      <BookingModal 
        property={property as any} 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isLoggedIn={isLoggedIn}
      />
    </>
  );
}
