import { Property, properties as initialProperties } from './properties-data';

const STORAGE_KEY = 'ecobooking_properties';
const EARNINGS_KEY = 'ecobooking_host_earnings';

export function getStoredProperties(): Property[] {
  if (typeof window === 'undefined') {
    return initialProperties;
  }
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProperties));
    return initialProperties;
  }
  
  try {
    return JSON.parse(stored);
  } catch (e) {
    return initialProperties;
  }
}

export function saveStoredProperties(properties: Property[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
  }
}

export interface BookingSimulation {
  id: string;
  propertyName: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
  status: 'completada' | 'activa' | 'pendiente';
}

export interface HostStats {
  totalEarnings: number;
  occupancyRate: number;
  averageRating: number;
  totalBookings: number;
  bookingsList: BookingSimulation[];
}

export function getHostStats(properties: Property[]): HostStats {
  if (typeof window === 'undefined') {
    return { totalEarnings: 0, occupancyRate: 0, averageRating: 0, totalBookings: 0, bookingsList: [] };
  }

  const stored = localStorage.getItem(EARNINGS_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Update property names in bookings list if they changed
      let changed = false;
      const updatedBookings = parsed.bookingsList.map((booking: BookingSimulation) => {
        // If it's a simulated booking, ensure the name matches the property if it exists
        const prop = properties.find(p => p.id === booking.id.replace('book-', 'prop-'));
        if (prop && prop.name !== booking.propertyName) {
          changed = true;
          return { ...booking, propertyName: prop.name, totalPrice: prop.price * booking.nights };
        }
        return booking;
      });
      if (changed) {
        parsed.bookingsList = updatedBookings;
        parsed.totalEarnings = updatedBookings
          .filter((b: BookingSimulation) => b.status === 'completada' || b.status === 'activa')
          .reduce((sum: number, b: BookingSimulation) => sum + b.totalPrice, 0);
        localStorage.setItem(EARNINGS_KEY, JSON.stringify(parsed));
      }
      return parsed;
    } catch (e) {
      // fallback to generating new
    }
  }

  // If no stats, generate some realistic simulated ones based on current properties
  const bookingsList: BookingSimulation[] = [
    {
      id: 'book-1',
      propertyName: properties[0]?.name || 'Cabaña Eco-Wood en la Sierra Nevada',
      guestName: 'Carlos Mendoza',
      checkIn: '2026-07-01',
      checkOut: '2026-07-04',
      nights: 3,
      totalPrice: (properties[0]?.price || 320000) * 3,
      status: 'completada',
    },
    {
      id: 'book-2',
      propertyName: properties[1]?.name || 'Apartamento Vista al Mar - Rodadero Elite',
      guestName: 'Sofía Gómez',
      checkIn: '2026-07-05',
      checkOut: '2026-07-10',
      nights: 5,
      totalPrice: (properties[1]?.price || 450000) * 5,
      status: 'activa',
    },
    {
      id: 'book-3',
      propertyName: properties[2]?.name || 'Casa Colonial del Centro Histórico',
      guestName: 'John Doe',
      checkIn: '2026-07-12',
      checkOut: '2026-07-15',
      nights: 3,
      totalPrice: (properties[2]?.price || 750000) * 3,
      status: 'pendiente',
    }
  ];

  const totalEarnings = bookingsList
    .filter(b => b.status === 'completada' || b.status === 'activa')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const avgRating = properties.length > 0
    ? properties.reduce((sum, p) => sum + p.rating, 0) / properties.length
    : 4.8;

  const stats: HostStats = {
    totalEarnings,
    occupancyRate: 78, // 78% occupancy
    averageRating: parseFloat(avgRating.toFixed(2)),
    totalBookings: bookingsList.length,
    bookingsList
  };

  localStorage.setItem(EARNINGS_KEY, JSON.stringify(stats));
  return stats;
}

export function saveHostStats(stats: HostStats): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(EARNINGS_KEY, JSON.stringify(stats));
  }
}
