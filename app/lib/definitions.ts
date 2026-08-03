// Definiciones de tipos TypeScript para EcoBooking (Alquiler Vacacional)

export type Role = 'admin' | 'host' | 'guest';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string; // Optional for security when fetching public data
  role: Role;
  created_at: string;
};

export type Property = {
  id: string;
  host_id: string;
  title: string;
  description: string;
  city: string;
  country: string;
  category: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  rating: number;
  created_at: string;
};

export type Image = {
  id: string;
  property_id: string;
  url: string;
  is_primary: boolean;
  created_at: string;
};

export type Booking = {
  id: string;
  property_id: string;
  guest_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: BookingStatus;
  created_at: string;
};

export type Review = {
  id: string;
  property_id: string;
  guest_id: string;
  rating: number;
  comment: string;
  created_at: string;
};

// Tipos formateados para la UI (Consultas JOIN)

export type PropertyWithPrimaryImage = Property & {
  image_url?: string;
  host_name?: string;
};

export type PropertyDetail = Property & {
  host_name: string;
  host_email: string;
  images: Image[];
};

export type FormattedBooking = Booking & {
  property_title: string;
  property_city: string;
  guest_name: string;
  guest_email: string;
  property_image?: string;
};

export type ReviewWithGuest = Review & {
  guest_name: string;
};

export type Revenue = {
  month: string;
  revenue: number;
};

export type CustomersTableType = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: string;
  total_paid: string;
};

export type FormattedCustomersTable = CustomersTableType;

export type PropertyFilters = {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  guests?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  startDate?: string;
  endDate?: string;
};




