import Image from 'next/image';
import { StarIcon } from '@heroicons/react/24/solid';

interface CardInicioProps {
  title: string;
  description: string;
  image: string;
}

export function CardInicio({ title, description, image }: CardInicioProps) {
  return (
    <div className="relative flex flex-col my-4 bg-white shadow-sm border border-slate-200/80 rounded-2xl w-full max-w-sm overflow-hidden hover:shadow-md transition-shadow">
      
      {/* Contenedor de Imagen */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
      </div>

      {/* Contenido de la Tarjeta */}
      <div className="p-4 flex flex-col flex-1">
        
        {/* Título y Calificación sin desbordamiento */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-slate-800 text-base font-bold truncate flex-1 min-w-0" title={title}>
            {title}
          </h3>
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 shrink-0">
            <StarIcon className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-slate-700 text-xs font-extrabold">5.0</span>
          </div>
        </div>

        {/* Descripción */}
        <p className="text-slate-500 text-xs leading-relaxed font-normal line-clamp-2 mb-4 flex-1">
          {description}
        </p>

        {/* Botón Ver Alojamiento */}
        <button className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 px-4 text-xs font-bold text-white transition-colors shadow-sm">
          Ver Alojamiento
        </button>
      </div>

    </div>
  );
}
