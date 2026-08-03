'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  XMarkIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

const AVAILABLE_AMENITIES = [
  'WiFi',
  'Aire Acondicionado',
  'Piscina',
  'Vista al Mar',
  'Vista a la Montaña',
  'Cocina',
  'Parqueadero',
  'Jacuzzi',
  'Zona de Fogatas',
  'Senderismo',
  'Desayuno Incluido',
  'Pet Friendly',
];

export default function SearchFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Estados de filtros
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [guests, setGuests] = useState(Number(searchParams.get('guests')) || 1);
  const [minPrice, setMinPrice] = useState(Number(searchParams.get('minPrice')) || 0);
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('maxPrice')) || 1500000);
  const [bedrooms, setBedrooms] = useState(Number(searchParams.get('bedrooms')) || 0);
  const [bathrooms, setBathrooms] = useState(Number(searchParams.get('bathrooms')) || 0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    searchParams.get('amenities') ? searchParams.get('amenities')!.split(',') : []
  );

  // Contar cuántos filtros secundarios están activos
  const activeFiltersCount =
    (minPrice > 0 ? 1 : 0) +
    (maxPrice < 1500000 ? 1 : 0) +
    (bedrooms > 0 ? 1 : 0) +
    (bathrooms > 0 ? 1 : 0) +
    selectedAmenities.length;

  const updateURLParams = useDebouncedCallback((newParamsRecord: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');

    Object.entries(newParamsRecord).forEach(([key, val]) => {
      if (val !== undefined && val !== '' && val !== 0) {
        params.set(key, String(val));
      } else {
        params.delete(key);
      }
    });

    replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleQueryChange = (term: string) => {
    setQuery(term);
    updateURLParams({ query: term });
  };

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    updateURLParams({ startDate: start, endDate: end });
  };

  const handleGuestsChange = (g: number) => {
    setGuests(g);
    updateURLParams({ guests: g > 1 ? g : undefined });
  };

  const handleApplyModalFilters = () => {
    const paramsRecord: Record<string, string | number | undefined> = {
      minPrice: minPrice > 0 ? minPrice : undefined,
      maxPrice: maxPrice < 1500000 ? maxPrice : undefined,
      bedrooms: bedrooms > 0 ? bedrooms : undefined,
      bathrooms: bathrooms > 0 ? bathrooms : undefined,
      amenities: selectedAmenities.length > 0 ? selectedAmenities.join(',') : undefined,
    };

    updateURLParams(paramsRecord);
    setIsFilterModalOpen(false);
  };

  const handleResetFilters = () => {
    setMinPrice(0);
    setMaxPrice(1500000);
    setBedrooms(0);
    setBathrooms(0);
    setSelectedAmenities([]);
    setStartDate('');
    setEndDate('');
    setGuests(1);
    setQuery('');

    replace(pathname);
    setIsFilterModalOpen(false);
  };

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-4">
      
      {/* Barra de Búsqueda Principal */}
      <div className="bg-white border border-slate-200/80 p-2 sm:p-3 rounded-3xl shadow-lg shadow-slate-200/40 flex flex-col md:flex-row gap-2 items-center justify-between">
        
        {/* Término / Ciudad */}
        <div className="flex-1 w-full relative flex items-center">
          <MagnifyingGlassIcon className="w-5 h-5 text-emerald-500 absolute left-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="¿A dónde quieres ir? (Santa Marta, Rodadero, Minca)..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-100 focus:border-emerald-500 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Fechas */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto py-1">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-2xl p-1.5 px-3">
            <CalendarDaysIcon className="w-4 h-4 text-emerald-500 shrink-0" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleDateChange(e.target.value, endDate)}
              className="bg-transparent text-[11px] font-bold text-slate-700 focus:outline-none cursor-pointer"
            />
            <span className="text-slate-300 text-xs font-bold">-</span>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => handleDateChange(startDate, e.target.value)}
              className="bg-transparent text-[11px] font-bold text-slate-700 focus:outline-none cursor-pointer"
            />
          </div>

          {/* Huéspedes */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-2xl px-3 py-2 shrink-0">
            <UserGroupIcon className="w-4 h-4 text-emerald-500" />
            <select
              value={guests}
              onChange={(e) => handleGuestsChange(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'huésped' : 'huéspedes'}
                </option>
              ))}
            </select>
          </div>

          {/* Botón Abrir Modal Filtros Avanzados */}
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-md shrink-0 relative"
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4 text-emerald-400" />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="bg-emerald-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center -mr-1 shadow-sm">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Badges de Filtros Activos si existen */}
      {(activeFiltersCount > 0 || startDate || endDate || guests > 1) && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Filtros aplicados:</span>
          {startDate && endDate && (
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
              🗓️ {startDate} al {endDate}
            </span>
          )}
          {guests > 1 && (
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
              👥 {guests} huéspedes
            </span>
          )}
          {minPrice > 0 && (
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
              💰 Min: {formatPrice(minPrice)}
            </span>
          )}
          {maxPrice < 1500000 && (
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
              💰 Max: {formatPrice(maxPrice)}
            </span>
          )}
          {selectedAmenities.map((amenity) => (
            <span key={amenity} className="bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold px-3 py-1 rounded-full">
              ✨ {amenity}
            </span>
          ))}

          <button
            onClick={handleResetFilters}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline ml-2"
          >
            Limpiar todo
          </button>
        </div>
      )}

      {/* MODAL DE FILTROS AVANZADOS */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
            
            {/* Header del Modal */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-emerald-500" />
                <span>Filtros Avanzados</span>
              </h3>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Cuerpo Scrollable */}
            <div className="overflow-y-auto p-6 space-y-6 flex-1">
              
              {/* Rango de Precios */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Rango de Precio por Noche (COP)
                </label>
                <div className="flex items-center justify-between text-xs font-black text-emerald-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span>{formatPrice(minPrice)}</span>
                  <span>-</span>
                  <span>{formatPrice(maxPrice)}</span>
                </div>
                <div className="flex gap-4 items-center pt-1">
                  <input
                    type="range"
                    min={0}
                    max={2000000}
                    step={50000}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Habitaciones y Baños */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">Habitaciones</label>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setBedrooms(num)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                          bedrooms === num
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {num === 0 ? 'Cualquiera' : `${num}+`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">Baños</label>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setBathrooms(num)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                          bathrooms === num
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {num === 0 ? 'Cualquiera' : `${num}+`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comodidades */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">Comodidades y Servicios</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {AVAILABLE_AMENITIES.map((amenity) => {
                    const isSelected = selectedAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleAmenity(amenity)}
                        className={`p-3 rounded-2xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                            : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100/70'
                        }`}
                      >
                        <span>{amenity}</span>
                        {isSelected && <span className="text-emerald-600 text-sm">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Footer del Modal */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 underline"
              >
                Limpiar todo
              </button>
              <button
                type="button"
                onClick={handleApplyModalFilters}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-2xl shadow-md transition-all"
              >
                Aplicar Filtros
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
