import { fetchPropertyById, fetchPropertyReviews } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import BookingWidget from './booking-widget';
import ReviewsSection from './reviews-section';
import { 
  StarIcon, 
  MapPinIcon, 
  ChevronLeftIcon,
  CheckCircleIcon
} from '@heroicons/react/24/solid';

import PropertyMap from '@/app/ui/map/property-map';

export default async function PropertyPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  const [property, reviews] = await Promise.all([
    fetchPropertyById(params.id),
    fetchPropertyReviews(params.id)
  ]);

  if (!property) {
    notFound();
  }

  // Identificar imagen principal y secundarias
  const primaryImage = property.images.length > 0 ? property.images[0].url : null;
  const secondaryImages = property.images.slice(1, 5); // Hasta 4 adicionales

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500">
      
      {/* Botón Volver */}
      <div>
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
          <ChevronLeftIcon className="w-4 h-4 mr-1" />
          Volver a inicio
        </Link>
      </div>

      {/* Título y Header */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
          {property.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
          {property.rating && (
            <div className="flex items-center gap-1">
              <StarIcon className="w-5 h-5 text-amber-500" />
              <span className="text-slate-800 font-bold">{Number(property.rating).toFixed(1)}</span>
            </div>
          )}
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1">
            <MapPinIcon className="w-4 h-4 text-emerald-500" />
            <span className="underline decoration-slate-300 hover:decoration-slate-400 cursor-pointer">
              {property.city}, {property.country}
            </span>
          </div>
          <span className="text-slate-300">•</span>
          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
            {property.category}
          </span>
        </div>
      </div>

      {/* Galería de Imágenes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-3xl overflow-hidden shadow-sm">
        <div className="relative aspect-square md:aspect-[4/3] bg-slate-100 group">
          {primaryImage ? (
            <img 
              src={primaryImage} 
              alt={property.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">Sin imagen</div>
          )}
        </div>
        
        <div className="hidden md:grid grid-cols-2 gap-2">
          {secondaryImages.map((img, idx) => (
            <div key={img.id} className="relative aspect-square bg-slate-100 group overflow-hidden">
              <img 
                src={img.url} 
                alt={`${property.title} foto ${idx + 2}`} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          ))}
          {/* Si faltan imágenes para llenar la cuadrícula (hasta 4) */}
          {Array.from({ length: Math.max(0, 4 - secondaryImages.length) }).map((_, idx) => (
            <div key={`empty-${idx}`} className="relative aspect-square bg-slate-50 flex items-center justify-center border border-slate-100">
              <span className="text-slate-300 text-sm font-medium">EcoBooking</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contenido principal y Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-6">
        
        {/* Columna Izquierda (Detalles) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Info del anfitrión y capacidad */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Alojamiento entero anfitrión: {property.host_name}
              </h2>
              <div className="flex items-center gap-3 mt-2 text-slate-500 text-sm">
                <span>{property.max_guests} huéspedes</span>
                <span>•</span>
                <span>{property.bedrooms} {property.bedrooms === 1 ? 'habitación' : 'habitaciones'}</span>
                <span>•</span>
                <span>{property.bathrooms} {property.bathrooms === 1 ? 'baño' : 'baños'}</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-black text-xl shadow-inner">
              {property.host_name ? property.host_name.charAt(0).toUpperCase() : 'H'}
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-4 pb-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Acerca de este espacio</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Comodidades */}
          <div className="space-y-4 pb-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Lo que ofrece este lugar</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {property.amenities.map(amenity => (
                <div key={amenity} className="flex items-center gap-3 text-slate-600">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mapa Interactivo de Ubicación */}
          <PropertyMap
            title={property.title}
            city={property.city}
            propertyId={property.id}
          />
          
        </div>

        {/* Columna Derecha (Sidebar Pegajoso / Booking) */}
        <div className="relative">
          <div className="sticky top-24">
            <BookingWidget
              propertyId={property.id}
              pricePerNight={Number(property.price_per_night)}
              maxGuests={property.max_guests}
              isLoggedIn={isLoggedIn}
            />
          </div>
        </div>

      </div>

      {/* Sección de Reseñas */}
      <ReviewsSection
        propertyId={property.id}
        reviews={reviews}
        currentRating={property.rating}
      />

    </div>
  );
}
