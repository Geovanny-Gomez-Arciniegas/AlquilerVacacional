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
}

export function CardInicio({ property }: CardInicioProps) {
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
              Sin imagen
            </div>
          )}
          
          {/* Calificación en estrella flotante */}
          {property.rating && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-full shadow-sm text-xs font-bold text-slate-800">
              <StarIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>{Number(property.rating).toFixed(1)}</span>
            </div>
          )}

          {/* Ubicación flotante */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 bg-slate-900/60 backdrop-blur-md rounded-full text-[11px] font-semibold text-white">
            <MapPinIcon className="w-3 h-3 text-emerald-400" />
            <span className="line-clamp-1">{property.city}</span>
          </div>
        </Link>

        {/* Detalles e Información */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div className="space-y-2.5">
            {/* Categoría y Capacidad */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-2.5 py-0.5 rounded-full">
                {property.category}
              </span>
              <span className="flex items-center gap-1 text-slate-500 font-medium">
                <UsersIcon className="w-3.5 h-3.5 text-slate-400" />
                Hasta {property.max_guests} huéspedes
              </span>
            </div>

            {/* Título */}
            <Link href={`/alojamientos/${property.id}`} className="hover:text-emerald-600 transition-colors">
              <h3 className="text-base font-extrabold text-slate-800 line-clamp-1 leading-snug group-hover:text-emerald-600 transition-colors">
                {property.title}
              </h3>
            </Link>

            {/* Descripción */}
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
              {property.description}
            </p>

            {/* Características rápidas */}
            <div className="flex gap-3 text-[11px] text-slate-400 border-t border-slate-50 pt-2.5 font-medium">
              <span>{property.bedrooms} {property.bedrooms === 1 ? 'Habitación' : 'Habitaciones'}</span>
              <span>•</span>
              <span>{property.bathrooms} {property.bathrooms === 1 ? 'Baño' : 'Baños'}</span>
            </div>
            
            {/* Amenities rápidos */}
            <div className="flex flex-wrap gap-1 pt-1.5">
              {amenities.slice(0, 3).map((amenity) => (
                <span 
                  key={amenity} 
                  className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100"
                >
                  {amenity}
                </span>
              ))}
              {amenities.length > 3 && (
                <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-dashed border-slate-200">
                  +{amenities.length - 3} más
                </span>
              )}
            </div>
          </div>

          {/* Precio y CTA */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Precio / Noche</span>
              <span className="text-lg font-extrabold text-slate-800 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                {formatPrice(property.price_per_night)}
              </span>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs tracking-wide uppercase rounded-xl shadow-md hover:shadow-lg shadow-emerald-50 hover:shadow-emerald-100 transition-all hover:-translate-y-[1px] active:translate-y-0 cursor-pointer"
            >
              Reservar
            </button>
          </div>
        </div>
      </div>

      {/* Modal interactivo */}
      {/* 
        NOTA: En la próxima refactorización BookingModal también
        debe aceptar PropertyWithPrimaryImage en lugar de Property
      */}
      <BookingModal 
        property={property as any} 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}