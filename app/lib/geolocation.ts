// Servicio de Geolocalización y Coordenadas para Santa Marta y alrededores

export type Coordinates = {
  lat: number;
  lng: number;
};

// Coordenadas predeterminadas por zona o ciudad
const LOCATION_COORDINATES: Record<string, Coordinates> = {
  'santa marta': { lat: 11.2408, lng: -74.199 },
  'rodadero': { lat: 11.2056, lng: -74.2256 },
  'el rodadero': { lat: 11.2056, lng: -74.2256 },
  'minca': { lat: 11.1444, lng: -74.1172 },
  'taganga': { lat: 11.2678, lng: -74.1906 },
  'tayrona': { lat: 11.3142, lng: -74.0247 },
  'parque tayrona': { lat: 11.3142, lng: -74.0247 },
  'pozos colorados': { lat: 11.1683, lng: -74.2325 },
  'bello horizonte': { lat: 11.1528, lng: -74.2347 },
  'centro historico': { lat: 11.2442, lng: -74.2125 },
  'centro histórico': { lat: 11.2442, lng: -74.2125 },
  'playa blanca': { lat: 11.2189, lng: -74.2341 },
};

/**
 * Obtiene las coordenadas latitud/longitud para una ciudad o nombre de ubicación.
 * Si no coincide exactamente, aplica un algoritmo de hash con ligera variación para distribuir marcadores en el mapa.
 */
export function getCoordinatesForLocation(locationName: string, propertyId?: string): Coordinates {
  const normalized = (locationName || '').toLowerCase().trim();

  // Buscar coincidencia directa por palabra clave
  for (const [key, coords] of Object.entries(LOCATION_COORDINATES)) {
    if (normalized.includes(key)) {
      if (propertyId) {
        // Añadir una ligera variación aleatoria/basada en hash para no superponer puntos exactos
        const hash = simpleHash(propertyId);
        const latOffset = ((hash % 100) - 50) * 0.0003;
        const lngOffset = (((hash >> 2) % 100) - 50) * 0.0003;
        return { lat: coords.lat + latOffset, lng: coords.lng + lngOffset };
      }
      return coords;
    }
  }

  // Coordenadas por defecto (Centro de Santa Marta) con offset por ID de propiedad
  const baseLat = 11.2408;
  const baseLng = -74.199;

  if (propertyId) {
    const hash = simpleHash(propertyId);
    const latOffset = ((hash % 100) - 50) * 0.002;
    const lngOffset = (((hash >> 2) % 100) - 50) * 0.002;
    return { lat: baseLat + latOffset, lng: baseLng + lngOffset };
  }

  return { lat: baseLat, lng: baseLng };
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
