export type BookingStatus =
  | 'draft'
  | 'pending_payment'
  | 'payment_verification'
  | 'confirmed'
  | 'pending_review'
  | 'cancelled'
  | 'completed'
  | 'refunded';

export type Booking = {
  id: string;
  reference: string;
  serviceId: string;
  serviceTitle: string;
  imageUrl?: string;
  isoDate: string;
  guests: number;
  status: BookingStatus;
  totalUSD: number;
};

const inDays = (days: number, hours = 7): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
};

const SEED_BOOKINGS: Booking[] = [
  {
    id: 'b-001',
    reference: 'LW-4KPZ8Q',
    serviceId: 'sunrise-game-drive',
    serviceTitle: 'Sunrise Game Drive',
    imageUrl:
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
    isoDate: inDays(4),
    guests: 2,
    status: 'confirmed',
    totalUSD: 290,
  },
  {
    id: 'b-002',
    reference: 'LW-9NB2WA',
    serviceId: 'rhino-tracking-walk',
    serviceTitle: 'Rhino Tracking Walk',
    imageUrl:
      'https://images.unsplash.com/photo-1567859667906-bafa2c14b4f2?auto=format&fit=crop&w=800&q=80',
    isoDate: inDays(11),
    guests: 3,
    status: 'pending_payment',
    totalUSD: 660,
  },
  {
    id: 'b-003',
    reference: 'LW-JT35CE',
    serviceId: 'guided-nature-walk',
    serviceTitle: 'Guided Nature Walk',
    imageUrl:
      'https://images.unsplash.com/photo-1533450718592-29d45635f0a9?auto=format&fit=crop&w=800&q=80',
    isoDate: inDays(-30),
    guests: 2,
    status: 'completed',
    totalUSD: 190,
  },
];

/** Mutable in-memory store so sandbox bookings survive navigation within a session. */
let bookingsState: Booking[] = [...SEED_BOOKINGS];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getBookings(): Booking[] {
  return bookingsState;
}

export function subscribeBookings(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export type NewBookingInput = {
  reference: string;
  serviceId: string;
  serviceTitle: string;
  imageUrl?: string;
  isoDate: string;
  guests: number;
  totalUSD: number;
  status?: BookingStatus;
};

export function addBooking(input: NewBookingInput): Booking {
  const booking: Booking = {
    id: `b-${Date.now()}`,
    reference: input.reference,
    serviceId: input.serviceId,
    serviceTitle: input.serviceTitle,
    imageUrl: input.imageUrl,
    isoDate: input.isoDate,
    guests: input.guests,
    status: input.status ?? 'confirmed',
    totalUSD: input.totalUSD,
  };
  bookingsState = [booking, ...bookingsState];
  emit();
  return booking;
}

export function upcomingBookings(source: Booking[] = getBookings()): Booking[] {
  const now = Date.now();
  return source.filter(
    (b) =>
      new Date(b.isoDate).getTime() >= now &&
      (b.status === 'confirmed' || b.status === 'pending_payment' || b.status === 'payment_verification'),
  );
}

export function pastBookings(source: Booking[] = getBookings()): Booking[] {
  const now = Date.now();
  return source.filter(
    (b) => new Date(b.isoDate).getTime() < now || b.status === 'completed' || b.status === 'cancelled',
  );
}
