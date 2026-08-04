'use client';

import { useState } from 'react';
import { ReviewWithGuest } from '@/app/lib/definitions';
import { createReview } from '@/app/lib/actions';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface ReviewsSectionProps {
  propertyId: string;
  reviews: ReviewWithGuest[];
  currentRating: number;
}

export default function ReviewsSection({ propertyId, reviews, currentRating }: ReviewsSectionProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('propertyId', propertyId);
      formData.append('rating', rating.toString());
      formData.append('comment', comment);

      await createReview(formData);
      setIsSubmitting(false);
      setComment('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pt-8 border-t border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <StarIcon className="w-6 h-6 text-amber-500" />
            <span>{currentRating ? Number(currentRating).toFixed(1) : 'Nuevo'}</span>
            <span className="text-slate-400 font-normal text-base">
              ({reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'})
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">Calificaciones verificadas de huéspedes reales.</p>
        </div>
      </div>

      {/* Formulario de Nueva Reseña */}
      <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
        <h4 className="font-bold text-slate-800 text-sm">Deja tu opinión sobre este alojamiento</h4>
        
        {submitted && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold animate-in fade-in">
            ¡Gracias por tu reseña! Tu opinión ayuda a mantener la comunidad sostenible de EcoBooking.
          </div>
        )}

        {/* Selección de Estrellas */}
        <div className="flex items-center gap-1">
          <span className="text-xs font-semibold text-slate-600 mr-2">Tu calificación:</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 focus:outline-none transition-transform hover:scale-110"
            >
              {star <= (hoverRating || rating) ? (
                <StarIcon className="w-6 h-6 text-amber-500" />
              ) : (
                <StarOutlineIcon className="w-6 h-6 text-slate-300" />
              )}
            </button>
          ))}
        </div>

        {/* Comentario */}
        <div>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="¿Qué te pareció la estadía? Comparte los puntos fuertes del alojamiento..."
            className="w-full p-3 bg-white border border-slate-300 rounded-2xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none resize-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !comment.trim()}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs shadow-sm transition-all"
        >
          {isSubmitting ? 'Publicando...' : 'Publicar reseña'}
        </button>
      </form>

      {/* Lista de Reseñas */}
      {reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-white border border-slate-100 p-5 rounded-2xl space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-xs">
                    {rev.guest_name ? rev.guest_name.charAt(0).toUpperCase() : 'H'}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">{rev.guest_name || 'Huésped'}</h5>
                    <p className="text-[10px] text-slate-400">
                      {new Date(rev.created_at).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-3.5 h-3.5 ${i < rev.rating ? 'text-amber-500' : 'text-slate-200'}`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed italic">
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center text-slate-400 text-xs">
          Aún no hay reseñas registradas para este alojamiento. ¡Sé el primero en calificarlo!
        </div>
      )}
    </div>
  );
}
