'use client';

import { useState, useEffect } from 'react';
import { Property } from '@/app/lib/properties-data';
import {
  getStoredProperties,
  saveStoredProperties,
  getHostStats,
  saveHostStats,
  BookingSimulation,
  HostStats,
} from '@/app/lib/properties-store';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  BanknotesIcon,
  ChartPieIcon,
  StarIcon,
  HomeModernIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const CATEGORIES = ['Cabañas', 'Casas', 'Apartamentos', 'Fincas', 'Habitaciones'] as const;

const DEFAULT_IMAGES: Record<string, string> = {
  'Cabañas': 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80',
  'Casas': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'Apartamentos': 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
  'Fincas': 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
  'Habitaciones': 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
};

const RANDOM_GUESTS = [
  'Juan Carlos Ortiz',
  'Margarita Restrepo',
  'Santiago Villamil',
  'Camila Echeverry',
  'Mateo Bermúdez',
  'Daniela Ospina',
  'Andrés Felipe Caro',
  'Isabella Restrepo',
];

export default function HostDashboardPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<HostStats | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'properties' | 'bookings'>('properties');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

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

  // Available amenities to choose from
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

  // Load from localStorage on mount
  useEffect(() => {
    const loadedProps = getStoredProperties();
    setProperties(loadedProps);
    setStats(getHostStats(loadedProps));
    setIsMounted(true);
  }, []);

  // Sync stats when properties change
  const updatePropertiesAndStats = (newProperties: Property[], newStats?: HostStats) => {
    setProperties(newProperties);
    saveStoredProperties(newProperties);
    
    const updatedStats = newStats || getHostStats(newProperties);
    // Recalculate average rating dynamically based on listings
    if (newProperties.length > 0) {
      const avgRating = newProperties.reduce((sum, p) => sum + p.rating, 0) / newProperties.length;
      updatedStats.averageRating = parseFloat(avgRating.toFixed(2));
    } else {
      updatedStats.averageRating = 0;
    }
    setStats(updatedStats);
    saveHostStats(updatedStats);
  };

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingProperty(null);
    setFormName('');
    setFormCategory('Cabañas');
    setFormDescription('');
    setFormLocation('Santa Marta, Colombia');
    setFormPrice(250000);
    setFormCapacity(4);
    setFormBedrooms(2);
    setFormBathrooms(1);
    setFormImage('');
    setUseDefaultImage(true);
    setFormAmenities(['WiFi', 'Aire Acondicionado']);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (property: Property) => {
    setEditingProperty(property);
    setFormName(property.name);
    setFormCategory(property.category);
    setFormDescription(property.description);
    setFormLocation(property.location);
    setFormPrice(property.price);
    setFormCapacity(property.capacity);
    setFormBedrooms(property.bedrooms);
    setFormBathrooms(property.bathrooms);
    setFormImage(property.image);
    
    // Check if it matches one of default images
    const isDefault = Object.values(DEFAULT_IMAGES).includes(property.image) || property.image === '/cabana/cabana.png';
    setUseDefaultImage(isDefault);
    setFormAmenities(property.amenities);
    setIsModalOpen(true);
  };

  // Delete property
  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este alojamiento? Esta acción no se puede deshacer.')) {
      const newProperties = properties.filter((p) => p.id !== id);
      
      // Also clean up simulated bookings related to this deleted property
      let newStats = stats ? { ...stats } : null;
      if (newStats) {
        newStats.totalBookings = newStats.bookingsList.length;
      }
      
      updatePropertiesAndStats(newProperties, newStats || undefined);
    }
  };

  // Save Form (Create or Update)
  const handleSaveProperty = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalImage = useDefaultImage 
      ? (DEFAULT_IMAGES[formCategory] || DEFAULT_IMAGES['Cabañas'])
      : (formImage || DEFAULT_IMAGES[formCategory]);

    const propertyData: Property = {
      id: editingProperty ? editingProperty.id : `prop-${Date.now()}`,
      name: formName,
      category: formCategory,
      description: formDescription,
      location: formLocation,
      price: Number(formPrice),
      capacity: Number(formCapacity),
      bedrooms: Number(formBedrooms),
      bathrooms: Number(formBathrooms),
      image: finalImage,
      rating: editingProperty ? editingProperty.rating : 4.8, // Default rating for new properties
      amenities: formAmenities,
      featured: editingProperty ? editingProperty.featured : false,
    };

    let newProperties: Property[];
    if (editingProperty) {
      newProperties = properties.map((p) => (p.id === editingProperty.id ? propertyData : p));
    } else {
      newProperties = [propertyData, ...properties];
    }

    updatePropertiesAndStats(newProperties);
    setIsModalOpen(false);
  };

  // Simulate new random booking
  const handleSimulateBooking = () => {
    if (properties.length === 0 || !stats) return;

    // Pick random property
    const randomPropIndex = Math.floor(Math.random() * properties.length);
    const selectedProp = properties[randomPropIndex];

    // Pick random guest name
    const randomGuest = RANDOM_GUESTS[Math.floor(Math.random() * RANDOM_GUESTS.length)];

    // Generate random nights between 2 and 6
    const nights = Math.floor(Math.random() * 5) + 2;
    const totalPrice = selectedProp.price * nights;

    // Dates
    const today = new Date();
    const futureDays = Math.floor(Math.random() * 15) + 1;
    const checkInDate = new Date(today);
    checkInDate.setDate(today.getDate() + futureDays);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkInDate.getDate() + nights);

    const padZero = (n: number) => String(n).padStart(2, '0');
    const formatDate = (d: Date) => `${d.getFullYear()}-${padZero(d.getMonth() + 1)}-${padZero(d.getDate())}`;

    // Random status
    const statuses: Array<'completada' | 'activa' | 'pendiente'> = ['completada', 'activa', 'pendiente'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const newBooking: BookingSimulation = {
      id: `book-${Date.now()}`,
      propertyName: selectedProp.name,
      guestName: randomGuest,
      checkIn: formatDate(checkInDate),
      checkOut: formatDate(checkOutDate),
      nights,
      totalPrice,
      status,
    };

    const newBookingsList = [newBooking, ...stats.bookingsList];
    const newTotalEarnings = newBookingsList
      .filter((b) => b.status === 'completada' || b.status === 'activa')
      .reduce((sum, b) => sum + b.totalPrice, 0);

    const updatedStats: HostStats = {
      ...stats,
      totalBookings: newBookingsList.length,
      bookingsList: newBookingsList,
      totalEarnings: newTotalEarnings,
    };

    setStats(updatedStats);
    saveHostStats(updatedStats);
  };

  // Reset to default data
  const handleResetToDefault = () => {
    if (confirm('¿Deseas restaurar todas las propiedades por defecto? Tus cambios locales se perderán.')) {
      localStorage.removeItem('ecobooking_properties');
      localStorage.removeItem('ecobooking_host_earnings');
      const loadedProps = getStoredProperties();
      setProperties(loadedProps);
      setStats(getHostStats(loadedProps));
    }
  };

  // Toggle Amenity selection
  const handleToggleAmenity = (amenity: string) => {
    if (formAmenities.includes(amenity)) {
      setFormAmenities(formAmenities.filter((a) => a !== amenity));
    } else {
      setFormAmenities([...formAmenities, amenity]);
    }
  };

  // Filters properties by category and search term
  const filteredProperties = properties.filter((p) => {
    const matchesCategory = selectedCategoryFilter === 'todos' || p.category === selectedCategoryFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (!isMounted || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <ArrowPathIcon className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-slate-400 text-sm font-semibold">Cargando Panel de Anfitrión...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
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
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs tracking-wide uppercase rounded-xl shadow-md hover:shadow-lg shadow-emerald-500/10 transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusIcon className="w-4 h-4 stroke-[3]" />
              Crear Alojamiento
            </button>
            <button
              onClick={handleResetToDefault}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-350 border border-slate-700 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
              title="Restaurar datos iniciales"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Restaurar
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Estadísticas (Simulación de Ganancias y Ocupación) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Tarjeta 1: Ingresos Totales */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-5 group hover:border-slate-200 transition-all hover:shadow-md">
          <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 group-hover:scale-105 transition-transform">
            <BanknotesIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ingresos Similados</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">
              {formatPrice(stats.totalEarnings)}
            </h3>
            <p className="text-[10px] text-emerald-500 font-semibold mt-0.5">Reservas activas/completadas</p>
          </div>
        </div>

        {/* Tarjeta 2: Ocupación */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-5 group hover:border-slate-200 transition-all hover:shadow-md">
          <div className="bg-sky-50 p-4 rounded-2xl text-sky-600 group-hover:scale-105 transition-transform">
            <ChartPieIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tasa de Ocupación</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">
              {stats.occupancyRate}%
            </h3>
            <p className="text-[10px] text-sky-500 font-semibold mt-0.5">Simulación constante</p>
          </div>
        </div>

        {/* Tarjeta 3: Calificación */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-5 group hover:border-slate-200 transition-all hover:shadow-md">
          <div className="bg-amber-50 p-4 rounded-2xl text-amber-505 text-amber-500 group-hover:scale-105 transition-transform">
            <StarIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Calificación Promedio</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">
              ⭐ {stats.averageRating.toFixed(2)}
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Sobre {properties.length} alojamientos</p>
          </div>
        </div>

        {/* Tarjeta 4: Total Reservas */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-5 group hover:border-slate-200 transition-all hover:shadow-md">
          <div className="bg-purple-50 p-4 rounded-2xl text-purple-600 group-hover:scale-105 transition-transform">
            <CalendarDaysIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Reservas</p>
            <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">
              {stats.totalBookings}
            </h3>
            <p className="text-[10px] text-purple-500 font-semibold mt-0.5">Historial acumulado</p>
          </div>
        </div>
      </div>

      {/* Tabs de Navegación */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('properties')}
          className={`pb-3 text-sm font-extrabold transition-all border-b-2 tracking-wide uppercase ${
            activeTab === 'properties'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Mis Alojamientos ({properties.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 text-sm font-extrabold transition-all border-b-2 tracking-wide uppercase ${
            activeTab === 'bookings'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Simulación de Ganancias ({stats.bookingsList.length})
        </button>
      </div>

      {/* Contenido según la pestaña */}
      {activeTab === 'properties' ? (
        <div className="space-y-6">
          {/* Barra de Filtros y Búsqueda */}
          <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Buscador */}
            <div className="relative flex-1 w-full">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o ubicación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-300 focus:bg-white transition-all"
              />
            </div>
            
            {/* Filtro Categoría */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto py-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategoryFilter('todos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategoryFilter === 'todos'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'text-slate-500 hover:bg-slate-50 border border-transparent'
                }`}
              >
                Todos
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCategoryFilter === cat
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'text-slate-500 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Propiedades */}
          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <div
                  key={property.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Imagen con categoría flotante */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                      <img
                        src={property.image}
                        alt={property.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                        {property.category}
                      </span>
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-full shadow-sm text-xs font-bold text-slate-800">
                        ⭐ {property.rating.toFixed(1)}
                      </div>
                    </div>

                    {/* Detalles */}
                    <div className="p-5 space-y-2">
                      <h3 className="text-sm font-extrabold text-slate-850 line-clamp-1">
                        {property.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium line-clamp-1">
                        📍 {property.location}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-light">
                        {property.description}
                      </p>
                      <div className="flex gap-4 text-[10px] text-slate-400 font-semibold border-t border-slate-50 pt-2.5">
                        <span>👥 Max {property.capacity} huesp.</span>
                        <span>•</span>
                        <span>🛏️ {property.bedrooms} hab.</span>
                        <span>•</span>
                        <span>🚿 {property.bathrooms} bañ.</span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="p-5 border-t border-slate-55 border-slate-50 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Precio / Noche</span>
                      <span className="text-sm font-extrabold text-slate-800">
                        {formatPrice(property.price)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEdit(property)}
                        className="p-2 border border-slate-200 hover:border-slate-350 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors cursor-pointer"
                        title="Editar alojamiento"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(property.id)}
                        className="p-2 border border-rose-100 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar alojamiento"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3 shadow-sm">
              <p className="text-slate-400 text-sm font-medium">No se encontraron alojamientos.</p>
              <p className="text-xs text-slate-400">Intenta buscando con otro término o crea uno nuevo.</p>
              <button
                onClick={handleOpenCreate}
                className="mt-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Crear nuevo alojamiento
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Pestaña: Simulación de Ganancias */
        <div className="space-y-6">
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-emerald-800 uppercase tracking-wide">
                Simulador de Reservas en Vivo
              </h3>
              <p className="text-xs text-emerald-600 leading-relaxed font-medium">
                Genera una simulación en tiempo real de una reserva realizada por un huésped. Se calcularán las noches y el costo total de tu propiedad y se sumarán automáticamente a tus ganancias acumuladas.
              </p>
            </div>
            <button
              onClick={handleSimulateBooking}
              disabled={properties.length === 0}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs tracking-wide uppercase rounded-xl shadow-md transition-all shrink-0 flex items-center gap-2 cursor-pointer"
            >
              🚀 Simular Reserva
            </button>
          </div>

          {/* Tabla de Reservas Simuladas */}
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="p-4 sm:p-5">Huésped</th>
                    <th className="p-4 sm:p-5">Propiedad</th>
                    <th className="p-4 sm:p-5">Fechas</th>
                    <th className="p-4 sm:p-5">Noches</th>
                    <th className="p-4 sm:p-5">Precio Total</th>
                    <th className="p-4 sm:p-5">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {stats.bookingsList.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 sm:p-5 font-bold text-slate-800">{booking.guestName}</td>
                      <td className="p-4 sm:p-5 text-slate-600 max-w-[200px] truncate">{booking.propertyName}</td>
                      <td className="p-4 sm:p-5 text-slate-500 font-medium font-mono">
                        {booking.checkIn} a {booking.checkOut}
                      </td>
                      <td className="p-4 sm:p-5 text-slate-500 font-semibold">{booking.nights} noches</td>
                      <td className="p-4 sm:p-5 font-bold text-slate-800">{formatPrice(booking.totalPrice)}</td>
                      <td className="p-4 sm:p-5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${
                            booking.status === 'completada'
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                              : booking.status === 'activa'
                              ? 'bg-sky-50 border-sky-100 text-sky-700'
                              : 'bg-amber-50 border-amber-100 text-amber-700'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {stats.bookingsList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                        No hay reservas simuladas aún. Haz clic en "Simular Reserva" arriba para ver la magia.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Formulario Modal (Crear / Editar) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="px-6 py-4.5 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="text-base font-extrabold tracking-tight">
                {editingProperty ? 'Editar Alojamiento' : 'Nuevo Alojamiento'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Contenido del Formulario (Scrollable) */}
            <form onSubmit={handleSaveProperty} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Información Básica */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                  Información Básica
                </h4>
                
                {/* Nombre */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Nombre del Alojamiento *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej. Cabaña Rustica de Madera con Vista al Mar"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Categoría */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Categoría *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as typeof CATEGORIES[number])}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ubicación */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Ubicación / Sector *</label>
                    <input
                      type="text"
                      required
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      placeholder="Ej. Minca, Sierra Nevada"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Descripción del Alojamiento *</label>
                  <textarea
                    required
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Escribe detalles atractivos sobre el espacio, comodidad, vistas y alrededores..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Precios y Capacidad */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                  Precios y Detalles Internos
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Precio por noche */}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Precio / Noche (COP) *</label>
                    <input
                      type="number"
                      required
                      min={50000}
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Capacidad */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Capacidad *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formCapacity}
                      onChange={(e) => setFormCapacity(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Habitaciones */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Habitaciones *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formBedrooms}
                      onChange={(e) => setFormBedrooms(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Baños */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Baños *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formBathrooms}
                      onChange={(e) => setFormBathrooms(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Imagen */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                  Foto de Portada
                </h4>
                
                {/* Tipo de Imagen */}
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                    <input
                      type="radio"
                      checked={useDefaultImage}
                      onChange={() => setUseDefaultImage(true)}
                      className="accent-emerald-500"
                    />
                    Imagen de Categoría Predeterminada
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                    <input
                      type="radio"
                      checked={!useDefaultImage}
                      onChange={() => setUseDefaultImage(false)}
                      className="accent-emerald-500"
                    />
                    URL de Foto Personalizada
                  </label>
                </div>

                {useDefaultImage ? (
                  <div className="p-4 bg-slate-50 border border-slate-150 border-slate-200 rounded-2xl flex items-center gap-4">
                    <img
                      src={DEFAULT_IMAGES[formCategory]}
                      alt="Preview"
                      className="w-20 h-14 object-cover rounded-xl border border-slate-200 shadow-sm"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-700">Se usará una foto profesional de Unsplash</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Optimizada según tu categoría de {formCategory}.</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">URL de la Imagen *</label>
                    <input
                      type="text"
                      required={!useDefaultImage}
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                    />
                    {formImage && (
                      <div className="mt-3">
                        <img
                          src={formImage}
                          alt="Preview Custom"
                          className="w-20 h-14 object-cover rounded-xl border border-slate-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                  Comodidades (Amenities)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {AVAILABLE_AMENITIES.map((amenity) => {
                    const isSelected = formAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => handleToggleAmenity(amenity)}
                        className={`px-3 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm shadow-emerald-50/50'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {amenity}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botones del Modal */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-250 border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-650 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs tracking-wide uppercase rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Guardar Alojamiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
