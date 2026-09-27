import { supabase } from '@/lib/supabase';
import type { Booking } from '@/services/types';

const SELECT =
  'id, reference, user_id, service_id, service_title, image_url, booking_date, guests, amount, currency, status, payment_status, created_at';

type Row = {
  id: string;
  reference: string;
  user_id: string | null;
  service_id: string;
  service_title: string;
  image_url: string | null;
  booking_date: string;
  guests: number;
  amount: number | string;
  currency: string;
  status: Booking['status'];
  payment_status: Booking['paymentStatus'];
  created_at: string;
};

function mapRow(r: Row): Booking {
  return {
    id: r.id,
    reference: r.reference,
    userId: r.user_id,
    serviceId: r.service_id,
    serviceTitle: r.service_title,
    imageUrl: r.image_url,
    bookingDate: r.booking_date,
    guests: r.guests,
    amount: Number(r.amount),
    currency: r.currency,
    status: r.status,
    paymentStatus: r.payment_status,
    createdAt: r.created_at,
  };
}

const REF_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateBookingReference(): string {
  let ref = 'LW-';
  for (let i = 0; i < 6; i += 1) ref += REF_CHARS[Math.floor(Math.random() * REF_CHARS.length)];
  return ref;
}

export async function listMyBookings(userId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(SELECT)
    .eq('user_id', userId)
    .order('booking_date', { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(mapRow);
}

export type NewBookingInput = {
  userId: string;
  serviceId: string;
  serviceTitle: string;
  imageUrl?: string | null;
  bookingDate: string;
  guests: number;
  amount: number;
  currency?: string;
  leadGuest?: { fullName: string; email?: string; phone?: string } | null;
  specialRequests?: string | null;
};

/**
 * Creates a booking row in `pending_payment` state. A payment must be
 * initialized and verified server-side before the booking is confirmed.
 */
export async function createBooking(input: NewBookingInput): Promise<Booking> {
  const reference = generateBookingReference();
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      reference,
      user_id: input.userId,
      service_id: input.serviceId,
      service_title: input.serviceTitle,
      image_url: input.imageUrl ?? null,
      booking_date: input.bookingDate,
      guests: input.guests,
      amount: input.amount,
      currency: input.currency ?? 'KES',
      status: 'pending_payment',
      payment_status: 'pending',
      special_requests: input.specialRequests ?? null,
    })
    .select(SELECT)
    .single();
  if (error) throw error;

  if (input.leadGuest?.fullName) {
    const { error: guestErr } = await supabase.from('booking_guests').insert({
      booking_id: (data as Row).id,
      full_name: input.leadGuest.fullName,
      email: input.leadGuest.email ?? null,
      phone: input.leadGuest.phone ?? null,
      is_lead: true,
    });
    if (guestErr) throw guestErr;
  }

  return mapRow(data as Row);
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const { data, error } = await supabase.from('bookings').select(SELECT).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as Row) : null;
}

export async function cancelBooking(id: string): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', id);
  if (error) throw error;
}
