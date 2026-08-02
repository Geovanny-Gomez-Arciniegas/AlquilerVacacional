'use client';

import { useState, useTransition } from 'react';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  BanknotesIcon,
  ChartPieIcon,
  StarIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { createProperty, updateProperty, deleteProperty, simulateBooking } from '@/app/lib/actions';

const CATEGORIES = ['Cabañas', 'Casas', 'Apartamentos', 'Fincas', 'Habitaciones'] as const;

const DEFAULT_IMAGES: Record<string, string> = {
  'Cabañas': 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80',
  'Casas': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'Apartamentos': 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  'Fincas': 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
  'Habitaciones': 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
};

// Types corresponding to the DB
export type HostProperty = {
  id: string;
  title: string;
  city: string;
  country: string;
  category: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  rating: number;
  description: string;
  image_url?: string;
};


export type HostStats = {
  totalEarnings: number;
  occupancyRate: number;
  averageRating: number;
  totalBookings: number;
  bookingsList: Array<{
    id: string;
    property_title: string;
    guest_name: string;
    start_date: string;
    end_date: string;
    total_price: number;
    status: string;
  }>;
};

export default function DashboardClient({
  properties,
  stats,
  hostId,
}: {
  properties: HostProperty[];
  stats: HostStats;
  hostId: string;
}) {
  const [activeTab, setActiveTab] = useState<'properties' | 'bookings'>('properties');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<HostProperty | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<typeof CATEGORIES[number]>('Cabañas');
  const [formDescription, setFormDescription] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formPrice, setFormPrice] = useState(250000);
  const [formCapacity, setFormCapacity] = useState(4);
  const [formBedrooms, setFormBedrooms] = useState(2);
  const [formBathrooms, setFormBathrooms] = useState(1);
  const [formImage, setFormImage] = useState('');
  const [useDefaultImage, setUseDefaultImage] = useState(true);
  const [formAmenities, setFormAmenities] = useState<string[]>(['WiFi', 'Aire Acondicionado']);

  const AVAILABLE_AMENITIES = [
    'WiFi', 'Aire Acondicionado', 'Piscina', 'Vista al Mar',
    'Vista a la Montaña', 'Cocina', 'Parqueadero', 'Jacuzzi',
    'Zona de Fogatas', 'Senderismo', 'Desayuno Incluido', 'Pet Friendly',
  ];

  const handleOpenCreate = () => {
    setEditingProperty(null);
    setFormName('');
    setFormCategory('Cabañas');
    setFormDescription('');
    setFormLocation('Santa Marta');
    setFormPrice(250000);
    setFormCapacity(4);
    setFormBedrooms(2);
    setFormBathrooms(1);
    setFormImage('');
    setUseDefaultImage(true);
    setFormAmenities(['WiFi', 'Aire Acondicionado']);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (property: HostProperty) => {
    setEditingProperty(property);
    setFormName(property.title);
    setFormCategory(property.category as typeof CATEGORIES[number] || 'Cabañas');
    setFormDescription(property.description);
    setFormLocation(property.city);
    setFormPrice(property.price_per_night);
    setFormCapacity(property.max_guests);
    setFormBedrooms(property.bedrooms);
    setFormBathrooms(property.bathrooms);
    setFormImage(property.image_url || '');
    
    const isDefault = property.image_url ? Object.values(DEFAULT_IMAGES).includes(property.image_url) : true;
    setUseDefaultImage(isDefault);
    setFormAmenities(property.amenities || []);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este alojamiento?')) {
      startTransition(async () => {
        await deleteProperty(id);
      });
    }
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', formName);
    formData.append('description', formDescription);
    formData.append('category', formCategory);
    formData.append('location', formLocation);
    formData.append('price', formPrice.toString());
    formData.append('capacity', formCapacity.toString());
    formData.append('bedrooms', formBedrooms.toString());
    formData.append('bathrooms', formBathrooms.toString());
    formData.append('useDefaultImage', useDefaultImage.toString());
    if (!useDefaultImage && formImage) {
      formData.append('image', formImage);
    }
    formAmenities.forEach(a => formData.append('amenities', a));

    startTransition(async () => {
      if (editingProperty) {
        await updateProperty(editingProperty.id, formData);
      } else {
        await createProperty(formData, hostId);
      }
      setIsModalOpen(false);
    });
  };

  const handleSimulateBookingClick = () => {
    startTransition(async () => {
      await simulateBooking(hostId);
    });
  };

  const handleToggleAmenity = (amenity: string) => {
    if (formAmenities.includes(amenity)) {
      setFormAmenities(formAmenities.filter((a) => a !== amenity));
    } else {
      setFormAmenities([...formAmenities, amenity]);
    }
  };

  const filteredProperties = properties.filter((p) => {
    const matchesCategory = selectedCategoryFilter === 'todos' || p.category === selectedCategoryFilter;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(val);
  };
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CO', { timeZone: 'UTC' });
  };

  return (
    <div className={`space-y-8 animate-in fade-in duration-300 ${isPending ? 'opacity-70 pointer-events-none' : ''}`}>
      {/* Sección Hero / Título */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-slate-800 shadow-md">
        <div className="absolute right-0 bottom-0 opacity-10 translate-y-12 translate-x-12 w-64 h-64 bg-emerald-400 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400">
              <SparklesIcon className="w-4 h-4" />
              <span>Gestión de Alojamientos</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              ¡Hola, Anfitrión!
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-light max-w-xl">
              Aquí puedes crear, editar y organizar tus cabañas, apartamentos y casas vacacionales. Además, simula reservas para ver tus ganancias acumuladas.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleOpenCreate}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs tracking-wide uppercase rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusIcon className="w-4 h-4 stroke-[3]" />
              Crear Alojamiento
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-5">
          <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600">
            <BanknotesIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ingresos Confirmados</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">
              {formatPrice(stats.totalEarnings)}
            </h3>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-5">
          <div className="bg-sky-50 p-4 rounded-2xl text-sky-600">
            <ChartPieIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ocupación Est.</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">
              {stats.occupancyRate}%
            </h3>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-5">
          <div className="bg-amber-50 p-4 rounded-2xl text-amber-500">
            <StarIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Calificación</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">
              ⭐ {stats.averageRating.toFixed(2)}
            </h3>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-5">
          <div className="bg-purple-50 p-4 rounded-2xl text-purple-600">
            <CalendarDaysIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Reservas</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">
              {stats.totalBookings}
            </h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('properties')}
          className={`pb-3 text-sm font-extrabold transition-all border-b-2 tracking-wide uppercase ${
            activeTab === 'properties' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400'
          }`}
        >
          Mis Alojamientos ({properties.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 text-sm font-extrabold transition-all border-b-2 tracking-wide uppercase ${
            activeTab === 'bookings' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400'
          }`}
        >
          Reservas ({stats.bookingsList.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'properties' ? (
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o ciudad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-emerald-300"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategoryFilter('todos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                  selectedCategoryFilter === 'todos' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500'
                }`}
              >
                Todos
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                    selectedCategoryFilter === cat ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <div key={property.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="relative aspect-[16/10] bg-slate-100">
                      <img src={property.image_url} alt={property.title} className="w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        {property.category}
                      </span>
                    </div>
                    <div className="p-5 space-y-2">
                      <h3 className="text-sm font-extrabold text-slate-800 line-clamp-1">{property.title}</h3>
                      <p className="text-xs text-slate-400 font-medium">📍 {property.city}</p>
                      <p className="text-[10px] text-slate-400 mt-2">
                        👥 Max {property.max_guests} • 🛏️ {property.bedrooms} hab • 🚿 {property.bathrooms} bañ
                      </p>
                    </div>
                  </div>
                  <div className="p-5 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">Precio / Noche</span>
                      <div className="text-sm font-extrabold text-slate-800">{formatPrice(property.price_per_night)}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenEdit(property)} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100">
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(property.id)} className="p-2 border border-rose-100 rounded-lg text-rose-500 hover:bg-rose-50">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center">
              <p className="text-slate-400 text-sm">No se encontraron alojamientos.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-sm font-extrabold text-emerald-800 uppercase">Simulador de Reservas</h3>
              <p className="text-xs text-emerald-600">Genera una reserva aleatoria en la base de datos.</p>
            </div>
            <button
              onClick={handleSimulateBookingClick}
              disabled={properties.length === 0}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase transition-all flex items-center"
            >
              🚀 Simular Reserva
            </button>
          </div>
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase border-b border-slate-100">
                  <th className="p-4">Huésped</th>
                  <th className="p-4">Propiedad</th>
                  <th className="p-4">Fechas</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {stats.bookingsList.map((b) => (
                  <tr key={b.id}>
                    <td className="p-4 font-bold">{b.guest_name}</td>
                    <td className="p-4">{b.property_title}</td>
                    <td className="p-4">{formatDate(b.start_date)} - {formatDate(b.end_date)}</td>
                    <td className="p-4 font-bold">{formatPrice(b.total_price)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border ${
                        b.status === 'confirmed' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                        b.status === 'pending' ? 'bg-sky-50 border-sky-100 text-sky-700' :
                        'bg-amber-50 border-amber-100 text-amber-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="text-base font-extrabold">{editingProperty ? 'Editar' : 'Nuevo'} Alojamiento</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveProperty} className="overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-600">Nombre *</label>
                <input required value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs" />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600">Categoría *</label>
                    <select value={formCategory} onChange={e => setFormCategory(e.target.value as any)} className="w-full px-3 py-2 border rounded-xl text-xs">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600">Ciudad *</label>
                    <input required value={formLocation} onChange={e => setFormLocation(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs" />
                  </div>
                </div>

                <label className="block text-xs font-bold text-slate-600">Descripción *</label>
                <textarea required rows={3} value={formDescription} onChange={e => setFormDescription(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600">Precio / Noche *</label>
                  <input type="number" required value={formPrice} onChange={e => setFormPrice(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600">Huéspedes *</label>
                  <input type="number" required value={formCapacity} onChange={e => setFormCapacity(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600">Habitaciones *</label>
                  <input type="number" required value={formBedrooms} onChange={e => setFormBedrooms(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl text-xs" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Imagen de Portada</label>
                <div className="flex gap-4 mb-3">
                  <label className="text-xs flex items-center gap-2"><input type="radio" checked={useDefaultImage} onChange={() => setUseDefaultImage(true)}/> Predeterminada</label>
                  <label className="text-xs flex items-center gap-2"><input type="radio" checked={!useDefaultImage} onChange={() => setUseDefaultImage(false)}/> URL Personalizada</label>
                </div>
                {!useDefaultImage && (
                  <input required value={formImage} onChange={e => setFormImage(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border rounded-xl text-xs" />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Comodidades</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {AVAILABLE_AMENITIES.map(amenity => (
                    <button key={amenity} type="button" onClick={() => handleToggleAmenity(amenity)} className={`px-2 py-2 border rounded-xl text-xs ${formAmenities.includes(amenity) ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'text-slate-600'}`}>
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-xl text-xs">Cancelar</button>
                <button type="submit" disabled={isPending} className="px-5 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase">{isPending ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
