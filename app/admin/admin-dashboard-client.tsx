'use client';

import { useState, useTransition } from 'react';
import {
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { updateProperty, deleteProperty } from '@/app/lib/actions';
import { HostProperty } from '@/app/host/dashboard-client';
import { compressAndConvertToWebP } from '@/app/lib/image-optimizer';
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';

const CATEGORIES = ['Cabaña', 'Casa', 'Apartamento', 'Finca', 'Habitación'] as const;

export type AdminProperty = HostProperty & {
  host_id: string;
  host_name?: string;
};

export default function AdminDashboardClient({
  properties,
}: {
  properties: AdminProperty[];
}) {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<AdminProperty | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<typeof CATEGORIES[number]>('Cabaña');
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

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleOpenEdit = async (property: AdminProperty) => {
    setEditingProperty(property);
    setFormName(property.title);
    setFormCategory(property.category as typeof CATEGORIES[number] || 'Cabaña');
    setFormDescription(property.description);
    setFormLocation(property.city);
    setFormPrice(property.price_per_night);
    setFormCapacity(property.max_guests);
    setFormBedrooms(property.bedrooms);
    setFormBathrooms(property.bathrooms);
    setFormImage(property.image_url || '');

    setUseDefaultImage(false);
    setUploadedImages([]);
    setFormAmenities(property.amenities || []);
    setIsModalOpen(true);

    try {
      const res = await fetch(`/api/properties/${property.id}/images`);
      if (res.ok) {
        const images: Array<{ url: string; is_primary: boolean }> = await res.json();
        if (images.length > 0) {
          const sortedUrls = images
            .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
            .map(i => i.url);
          setUploadedImages(sortedUrls);
        } else if (property.image_url) {
          setUploadedImages([property.image_url]);
        } else {
          setUseDefaultImage(true);
        }
      } else if (property.image_url) {
        setUploadedImages([property.image_url]);
      } else {
        setUseDefaultImage(true);
      }
    } catch {
      if (property.image_url) {
        setUploadedImages([property.image_url]);
      } else {
        setUseDefaultImage(true);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError('');
    setIsUploading(true);
    const newUrls: string[] = [];
    const failedFiles: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let fileToUpload = file;

        try {
          fileToUpload = await compressAndConvertToWebP(file);
        } catch (compressionErr) {
          fileToUpload = file;
        }

        try {
          const uploadFormData = new FormData();
          uploadFormData.append('file', fileToUpload);

          const res = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData,
          });

          const data = await res.json().catch(() => null);

          if (!res.ok || !data?.url) {
            throw new Error(data?.error || `Error ${res.status}`);
          }

          newUrls.push(data.url);
        } catch (singleUploadErr: any) {
          failedFiles.push(`${file.name} (${singleUploadErr?.message || 'Error de red'})`);
        }
      }

      if (newUrls.length > 0) {
        setUploadedImages(prev => [...prev, ...newUrls]);
        setUseDefaultImage(false);
      }

      if (failedFiles.length > 0) {
        setUploadError(`No se pudieron subir las siguientes imágenes: ${failedFiles.join(', ')}`);
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Ocurrió un error inesperado al subir las imágenes.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const updated = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(updated);
    if (updated.length === 0) {
      setUseDefaultImage(true);
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    const item = uploadedImages[index];
    const rest = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages([item, ...rest]);
  };

  const handleDelete = (id: string) => {
    // Confirmation before destroying records. This satisfies the Accidental Data Loss Prevention requirements for UI flows.
    if (confirm('⚠️ ATENCIÓN: ¿Estás seguro de que deseas eliminar este alojamiento permanentemente? Esta acción no se puede deshacer.')) {
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

    uploadedImages.forEach(url => formData.append('imageUrls', url));
    formAmenities.forEach(a => formData.append('amenities', a));

    startTransition(async () => {
      if (editingProperty) {
        await updateProperty(editingProperty.id, formData);
      }
      setIsModalOpen(false);
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
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.host_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className={`space-y-8 animate-in fade-in duration-300 ${isPending ? 'opacity-70 pointer-events-none' : ''}`}>
      {/* Sección Hero / Título */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-slate-800 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-rose-400">
              <ShieldCheckIcon className="w-4 h-4 shrink-0" />
              <span>Gestión Global</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Todos los Alojamientos
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-light max-w-xl">
              Aquí puedes ver, editar y eliminar cualquier alojamiento registrado en el sistema.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 flex items-center">
            <MagnifyingGlassIcon className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nombre, ciudad o anfitrión..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-none focus:border-rose-300"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategoryFilter('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${selectedCategoryFilter === 'todos' ? 'bg-rose-50 text-rose-700' : 'text-slate-500'
                }`}
            >
              Todos
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${selectedCategoryFilter === cat ? 'bg-rose-50 text-rose-700' : 'text-slate-500'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="relative aspect-[4/3] bg-slate-100">
                    <img src={property.image_url} alt={property.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full shadow-sm">
                      {property.category}
                    </span>
                    <span className="absolute bottom-3 left-3 text-[10px] font-bold text-slate-700 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full shadow-sm truncate max-w-[80%]">
                      👤 {property.host_name || 'Desconocido'}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-extrabold text-slate-800 line-clamp-1">{property.title}</h3>
                    <p className="text-xs text-slate-400 font-medium truncate">📍 {property.city}</p>
                    <p className="text-[10px] text-slate-400 mt-2 truncate">
                      👥 Max {property.max_guests} • 🛏️ {property.bedrooms} hab • 🚿 {property.bathrooms} bañ
                    </p>
                  </div>
                </div>
                <div className="p-4 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400">Precio / Noche</span>
                    <div className="text-sm font-extrabold text-slate-800">{formatPrice(property.price_per_night)}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenEdit(property)} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(property.id)} className="p-2 border border-rose-100 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors" title="Eliminar propiedad">
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

      {/* Modal Form for Editing */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="text-base font-extrabold">Editar Alojamiento (Admin)</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveProperty} className="overflow-y-auto p-6 space-y-6">
              <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl">
                 <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Modificando Alojamiento de:</p>
                 <p className="text-xs text-rose-900 font-extrabold mt-0.5">{editingProperty?.host_name}</p>
              </div>
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

              {/* Imágenes */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">Imágenes del Alojamiento</label>
                <div className="border-2 border-dashed border-slate-200 hover:border-rose-500/50 rounded-2xl p-4 bg-slate-50/50 text-center transition-colors">
                  <input
                    type="file"
                    id="file-upload-admin"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="file-upload-admin" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                    <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
                      <ArrowUpTrayIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 hover:underline">Haz clic para subir fotos reales</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Se optimizan y convierten a WebP automáticamente</span>
                    </div>
                  </label>
                </div>

                {isUploading && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-xs font-semibold text-rose-800">
                    <div className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                    <span>Optimizando y subiendo imágenes...</span>
                  </div>
                )}

                {uploadError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                    {uploadError}
                  </div>
                )}

                {uploadedImages.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Fotos subidas ({uploadedImages.length}):</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {uploadedImages.map((url, idx) => (
                        <div key={idx} className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden group border border-slate-200">
                          <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />

                          {idx === 0 ? (
                            <span className="absolute top-1.5 left-1.5 bg-rose-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">
                              Portada
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryImage(idx)}
                              className="absolute top-1.5 left-1.5 bg-black/60 hover:bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Hacer Portada
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-rose-600 text-white p-1 rounded-full backdrop-blur-sm transition-colors"
                          >
                            <XMarkIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex gap-4 mb-2">
                    <label className="text-xs flex items-center gap-1.5 font-medium text-slate-600 cursor-pointer">
                      <input type="radio" checked={useDefaultImage} onChange={() => setUseDefaultImage(true)} /> Usar predeterminada
                    </label>
                    <label className="text-xs flex items-center gap-1.5 font-medium text-slate-600 cursor-pointer">
                      <input type="radio" checked={!useDefaultImage && uploadedImages.length === 0} onChange={() => setUseDefaultImage(false)} /> URL Externa
                    </label>
                  </div>
                  {!useDefaultImage && uploadedImages.length === 0 && (
                    <input value={formImage} onChange={e => setFormImage(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Comodidades</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {AVAILABLE_AMENITIES.map(amenity => (
                    <button key={amenity} type="button" onClick={() => handleToggleAmenity(amenity)} className={`px-2 py-2 border rounded-xl text-xs ${formAmenities.includes(amenity) ? 'bg-rose-50 text-rose-700 border-rose-300' : 'text-slate-600'}`}>
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-xl text-xs">Cancelar</button>
                <button type="submit" disabled={isPending} className="px-5 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold uppercase">{isPending ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
