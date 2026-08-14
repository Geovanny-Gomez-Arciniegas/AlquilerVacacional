'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PropertyWithPrimaryImage } from '@/app/lib/definitions';
import { createBooking } from '@/app/lib/actions';
import { 
  XMarkIcon, 
  CalendarDaysIcon, 
  UsersIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface BookingModalProps {
  property: PropertyWithPrimaryImage;
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn?: boolean;
}

export default function BookingModal({ property, isOpen, onClose, isLoggedIn = false }: BookingModalProps) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-cargar fechas por defecto (mañana y pasado mañana)
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const dayAfter = new Date(today);
      dayAfter.setDate(today.getDate() + 3);

      setCheckIn(tomorrow.toISOString().split('T')[0]);
      setCheckOut(dayAfter.toISOString().split('T')[0]);
      setGuests(1);
      setIsConfirmed(false);
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calcular noches y montos
  let nights = 0;
  let subtotal = 0;
  let cleaningFee = 0;
  let serviceFee = 0;
  let total = 0;

  if (checkIn && checkOut) {
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const timeDiff = d2.getTime() - d1.getTime();
    if (timeDiff > 0) {
      nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
      subtotal = property.price_per_night * nights;
      cleaningFee = Math.round(property.price_per_night * 0.15); // 15% tarifa fija de limpieza
      serviceFee = Math.round(subtotal * 0.08); // 8% de comisión de servicio
      total = subtotal + cleaningFee + serviceFee;
    }
  }

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=/alojamientos/${property.id}`);
      return;
    }

    if (nights <= 0) {
      setErrorMsg('La fecha de salida debe ser posterior a la de entrada.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('propertyId', property.id);
      formData.append('startDate', checkIn);
      formData.append('endDate', checkOut);
      formData.append('totalPrice', total.toString());

      await createBooking(formData);
      
      const randCode = 'EB-' + Math.floor(100000 + Math.random() * 900000);
      setConfirmationCode(randCode);
      setIsConfirmed(true);
    } catch (err) {
      console.error(err);
      setErrorMsg('Ocurrió un error al procesar la reserva.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 z-10 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-emerald-500" />
            <span>Reservar Alojamiento</span>
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 flex-1">
          {!isConfirmed ? (
            <form onSubmit={handleBook} className="space-y-6">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Información Propiedad Rápida */}
              <div className="flex gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <img 
                  src={property.image_url || ''} 
                  alt={property.title}
                  className="w-20 h-20 object-cover rounded-xl border border-slate-200"
                />
                <div className="flex flex-col justify-center">
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-max">
                    {property.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-800 line-clamp-1 mt-1">
                    {property.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{property.city}</p>
                  <p className="text-sm font-extrabold text-slate-800 mt-1">
                    {formatPrice(property.price_per_night)} <span className="text-xs font-normal text-slate-500">/ noche</span>
                  </p>
                </div>
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <CalendarDaysIcon className="w-4 h-4 text-emerald-500" />
                    Entrada (Check-in)
                  </label>
                  <input 
                    type="date"
                    required
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <CalendarDaysIcon className="w-4 h-4 text-emerald-500" />
                    Salida (Check-out)
                  </label>
                  <input 
                    type="date"
                    required
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-700"
                  />
                </div>
              </div>

              {/* Huéspedes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <UsersIcon className="w-4 h-4 text-emerald-500" />
                  Número de Huéspedes
                </label>
                <select 
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-700"
                >
                  {Array.from({ length: property.max_guests }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Huésped' : 'Huéspedes'} (Max. {property.max_guests})
                    </option>
                  ))}
                </select>
              </div>

              {/* Desglose de Precios */}
              {nights > 0 ? (
                <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-3">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>{formatPrice(property.price_per_night)} x {nights} {nights === 1 ? 'noche' : 'noches'}</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Tarifa única de limpieza</span>
                    <span>{formatPrice(cleaningFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Comisión de servicio EcoBooking</span>
                    <span>{formatPrice(serviceFee)}</span>
                  </div>
                  <hr className="border-slate-100" />
                  <div className="flex justify-between text-base font-extrabold text-slate-800">
                    <span>Total estimado</span>
                    <span className="text-emerald-600">{formatPrice(total)}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl text-xs text-center">
                  Selecciona una fecha de salida posterior a la fecha de entrada para ver el cálculo del precio.
                </div>
              )}

              {/* Botón de Confirmación */}
              <button 
                type="submit"
                disabled={isSubmitting || (isLoggedIn && nights <= 0)}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-emerald-100 disabled:shadow-none hover:shadow-emerald-200 hover:-translate-y-[1px] active:translate-y-0 transition-all cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Confirmando...</span>
                  </>
                ) : isLoggedIn ? (
                  <span>Confirmar y Reservar</span>
                ) : (
                  <span>Iniciar sesión para reservar</span>
                )}
              </button>
            </form>
          ) : (
            /* Pantalla de reserva exitosa */
            <div className="py-8 px-4 flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 text-emerald-500 rounded-full flex items-center justify-center animate-bounce-slow">
                <CheckCircleIcon className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-extrabold text-slate-800">¡Reserva Confirmada!</h4>
              <p className="text-sm text-slate-600 max-w-sm">
                Hemos registrado tu reserva para <span className="font-semibold text-slate-800">{property.title}</span>. Todo está listo para tu viaje.
              </p>

              <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2.5 text-left text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="font-bold">Código de Confirmación:</span>
                  <span className="font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-md text-[13px]">{confirmationCode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fechas:</span>
                  <span className="font-semibold text-slate-800">{checkIn} hasta {checkOut} ({nights} noches)</span>
                </div>
                <div className="flex justify-between">
                  <span>Huéspedes:</span>
                  <span className="font-semibold text-slate-800">{guests}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Pagado:</span>
                  <span className="font-bold text-slate-800">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="pt-4 w-full">
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
