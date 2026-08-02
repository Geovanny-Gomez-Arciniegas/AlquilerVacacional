'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FormattedBooking } from '@/app/lib/definitions';
import { cancelBooking } from '@/app/lib/actions';
import { 
  CalendarIcon, 
  MapPinIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface GuestBookingsClientProps {
  bookings: FormattedBooking[];
}

export default function GuestBookingsClient({ bookings }: GuestBookingsClientProps) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) return;
    setCancellingId(bookingId);
    try {
      await cancelBooking(bookingId);
    } catch (err) {
      console.error(err);
      alert('No se pudo cancelar la reserva.');
    } finally {
      setCancellingId(null);
    }
  };

  const activeBookings = bookings.filter(b => b.status !== 'cancelled');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-md">
        <div className="relative z-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Portal de Huésped</span>
          <h1 className="text-3xl font-extrabold tracking-tight">Mis Reservas Sostenibles</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-light">
            Gestiona tus próximas estadías, revisa el historial de viajes y consulta el estado de tus reservas.
          </p>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Reservas Activas</div>
          <div className="text-2xl font-black text-slate-800 mt-1">{activeBookings.length}</div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Reservas Canceladas</div>
          <div className="text-2xl font-black text-slate-800 mt-1">{cancelledBookings.length}</div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="text-xs text-slate-500 font-medium">Total de Viajes</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{bookings.length}</div>
        </div>
      </div>

      {/* Lista de Reservas Activas */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-emerald-600" />
          <span>Próximas Estadías</span>
        </h2>

        {activeBookings.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {activeBookings.map((b) => (
              <div 
                key={b.id} 
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden shrink-0">
                    {b.property_image ? (
                      <img src={b.property_image} alt={b.property_title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs font-bold">Eco</div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {b.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900">{b.property_title}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPinIcon className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{b.property_city}</span>
                    </div>
                    <div className="text-xs text-slate-600 pt-1">
                      <span className="font-semibold">{formatDate(b.start_date)}</span> - <span className="font-semibold">{formatDate(b.end_date)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Total pagado</div>
                    <div className="text-lg font-black text-emerald-600">{formatPrice(b.total_price)}</div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link
                      href={`/alojamientos/${b.property_id}`}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      Ver propiedad
                    </Link>
                    <button
                      onClick={() => handleCancel(b.id)}
                      disabled={cancellingId === b.id}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      {cancellingId === b.id ? 'Cancelando...' : 'Cancelar reserva'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
            <p className="text-slate-500 text-sm font-medium">No tienes reservas activas por el momento.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 underline"
            >
              Explorar alojamientos disponibles <ChevronRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Historial o Canceladas */}
      {cancelledBookings.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h3 className="text-base font-bold text-slate-700">Reservas Canceladas</h3>
          <div className="grid grid-cols-1 gap-3">
            {cancelledBookings.map((b) => (
              <div key={b.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex justify-between items-center opacity-75">
                <div>
                  <div className="font-bold text-sm text-slate-700">{b.property_title}</div>
                  <div className="text-xs text-slate-500">{formatDate(b.start_date)} a {formatDate(b.end_date)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Cancelada</span>
                  <span className="text-xs font-semibold text-slate-600">{formatPrice(b.total_price)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
