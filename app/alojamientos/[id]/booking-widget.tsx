'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBooking } from '@/app/lib/actions';
import { CheckCircleIcon, CalendarIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface BookingWidgetProps {
  propertyId: string;
  pricePerNight: number;
  maxGuests: number;
}

export default function BookingWidget({ propertyId, pricePerNight, maxGuests }: BookingWidgetProps) {
  const router = useRouter();
  
  // Fechas por defecto: mañana a 3 días después
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextThreeDays = new Date(tomorrow);
  nextThreeDays.setDate(tomorrow.getDate() + 3);

  const formatDateForInput = (d: Date) => d.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(formatDateForInput(tomorrow));
  const [endDate, setEndDate] = useState(formatDateForInput(nextThreeDays));
  const [guests, setGuests] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Calcular número de noches
  const calculateNights = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const nights = calculateNights();
  const subtotal = nights * pricePerNight;
  const ecoFee = Math.round(subtotal * 0.05); // 5% tarifa ecológica de servicio
  const totalPrice = subtotal + ecoFee;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nights <= 0) {
      setErrorMsg('La fecha de salida debe ser posterior a la de llegada.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('propertyId', propertyId);
      formData.append('startDate', startDate);
      formData.append('endDate', endDate);
      formData.append('totalPrice', totalPrice.toString());
      
      await createBooking(formData);
      setIsSubmitting(false);
      setBookingSuccess(true);
    } catch (err) {
      console.error(err);
      setErrorMsg('Ocurrió un error al procesar tu reserva. Inténtalo de nuevo.');
      setIsSubmitting(false);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl text-center space-y-4 animate-in fade-in zoom-in duration-300">
        <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircleIcon className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-emerald-900">¡Reserva Confirmada!</h3>
        <p className="text-sm text-emerald-700 leading-relaxed">
          Tu estadía de <strong>{nights} {nights === 1 ? 'noche' : 'noches'}</strong> ha sido registrada con éxito.
        </p>
        <div className="bg-white/80 p-4 rounded-2xl border border-emerald-100 text-left text-xs space-y-2 text-slate-700">
          <div><span className="font-semibold text-slate-900">Llegada:</span> {startDate}</div>
          <div><span className="font-semibold text-slate-900">Salida:</span> {endDate}</div>
          <div><span className="font-semibold text-slate-900">Total pagado:</span> {formatPrice(totalPrice)}</div>
        </div>
        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={() => router.push('/mis-reservas')}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all"
          >
            Ver mis reservas
          </button>
          <button
            onClick={() => setBookingSuccess(false)}
            className="text-xs text-emerald-700 hover:underline font-medium pt-1"
          >
            Realizar otra reserva
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xl shadow-slate-200/50 space-y-6">
      <div className="flex items-end justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="text-2xl font-black text-slate-800">{formatPrice(pricePerNight)}</span>
          <span className="text-slate-500 text-sm font-medium ml-1">/ noche</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Contenedor de Formulario */}
      <div className="space-y-4">
        <div className="border border-slate-300 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 transition-all">
          <div className="flex divide-x divide-slate-300 border-b border-slate-300">
            <div className="p-3 flex-1 bg-slate-50 hover:bg-slate-100/80 transition-colors">
              <label className="block text-[10px] uppercase font-bold text-slate-700 tracking-wider">Llegada</label>
              <input
                type="date"
                value={startDate}
                min={formatDateForInput(today)}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-800 mt-1 focus:outline-none cursor-pointer"
                required
              />
            </div>
            <div className="p-3 flex-1 bg-slate-50 hover:bg-slate-100/80 transition-colors">
              <label className="block text-[10px] uppercase font-bold text-slate-700 tracking-wider">Salida</label>
              <input
                type="date"
                value={endDate}
                min={startDate || formatDateForInput(today)}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-800 mt-1 focus:outline-none cursor-pointer"
                required
              />
            </div>
          </div>
          <div className="p-3 bg-slate-50 hover:bg-slate-100/80 transition-colors">
            <label className="block text-[10px] uppercase font-bold text-slate-700 tracking-wider">Huéspedes</label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full bg-transparent text-xs font-semibold text-slate-800 mt-1 focus:outline-none cursor-pointer"
            >
              {Array.from({ length: maxGuests }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'huésped' : 'huéspedes'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Desglose de Precios */}
        {nights > 0 ? (
          <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex justify-between">
              <span>{formatPrice(pricePerNight)} x {nights} {nights === 1 ? 'noche' : 'noches'}</span>
              <span className="font-semibold text-slate-800">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tarifa de servicio sostenible (5%)</span>
              <span className="font-semibold text-slate-800">{formatPrice(ecoFee)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total</span>
              <span className="text-emerald-600">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-medium text-center">
            Selecciona fechas válidas para calcular el precio total.
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || nights <= 0}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-base shadow-md hover:shadow-lg hover:-translate-y-[1px] active:translate-y-0 transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Confirmando...</span>
            </>
          ) : (
            <span>Reservar ahora</span>
          )}
        </button>

        <div className="text-center text-slate-400 text-xs">
          Reserva garantizada con cancelación flexible.
        </div>
      </div>
    </form>
  );
}
