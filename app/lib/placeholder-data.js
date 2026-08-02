// Datos de prueba para EcoBooking (Alquiler Vacacional)
const users = [
  {
    id: '410544b2-4001-4271-9855-fec4b6a6442a',
    name: 'Admin User',
    email: 'admin@ecobooking.com',
    password: 'password123',
    role: 'admin',
  },
  {
    id: '3958dc9e-712f-4377-85e9-fec4b6a6442a',
    name: 'Host User',
    email: 'host@ecobooking.com',
    password: 'password123',
    role: 'host',
  },
  {
    id: '3958dc9e-742f-4377-85e9-fec4b6a6442a',
    name: 'Guest User',
    email: 'guest@ecobooking.com',
    password: 'password123',
    role: 'guest',
  }
];

const properties = [
  {
    id: '50ca3e18-62cd-11ee-8c99-0242ac120002',
    host_id: users[1].id,
    title: 'Cabaña del Bosque',
    description: 'Hermosa cabaña de madera rodeada de naturaleza, ideal para relajarse y desconectar de la ciudad.',
    city: 'Medellín',
    country: 'Colombia',
    price_per_night: 120.50,
    max_guests: 4,
  },
  {
    id: '76d65c26-f784-44a2-ac19-586678f7c2f2',
    host_id: users[1].id,
    title: 'Apartamento Frente al Mar',
    description: 'Apartamento moderno con vista al mar y acceso directo a la playa. Incluye todas las comodidades.',
    city: 'Cartagena',
    country: 'Colombia',
    price_per_night: 200.00,
    max_guests: 6,
  }
];

const images = [
  {
    id: '126eed9c-c90c-4ef6-a4a8-fcf7408d3c66',
    property_id: properties[0].id,
    url: 'https://images.ecobooking.com/cabana1-main.jpg',
    is_primary: true,
  },
  {
    id: 'CC27C14A-0ACF-4F4A-A6C9-D45682C144B9',
    property_id: properties[0].id,
    url: 'https://images.ecobooking.com/cabana1-room.jpg',
    is_primary: false,
  },
  {
    id: '13D07535-C59E-4157-A011-F8D2EF4E0CBB',
    property_id: properties[1].id,
    url: 'https://images.ecobooking.com/apto1-main.jpg',
    is_primary: true,
  }
];

const bookings = [
  {
    id: 'd6e15727-9fe1-4961-8c5b-ea44a9bd81aa',
    property_id: properties[0].id,
    guest_id: users[2].id,
    start_date: '2024-10-10',
    end_date: '2024-10-15',
    total_price: 602.50,
    status: 'confirmed',
  }
];

const reviews = [
  {
    id: '811544b2-4001-4271-9855-fec4b6a6442c',
    property_id: properties[0].id,
    guest_id: users[2].id,
    rating: 5,
    comment: 'Lugar increíble, totalmente recomendado. Muy limpio y el anfitrión muy amable.',
  }
];

module.exports = {
  users,
  properties,
  images,
  bookings,
  reviews,
};
