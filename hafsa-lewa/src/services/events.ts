import { supabase } from '@/lib/supabase';
import type { EventItem } from '@/services/types';

const SELECT =
  'id, title, description, event_type, start_at, end_at, location, organiser, capacity, registration_required, image_url';

type Row = {
  id: string;
  title: string;
  description: string | null;
  event_type: string | null;
  start_at: string;
  end_at: string | null;
  location: string | null;
  organiser: string | null;
  capacity: number | null;
  registration_required: boolean;
  image_url: string | null;
};

function mapRow(r: Row): EventItem {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    eventType: r.event_type,
    startAt: r.start_at,
    endAt: r.end_at,
    location: r.location,
    organiser: r.organiser,
    capacity: r.capacity,
    registrationRequired: r.registration_required,
    imageUrl: r.image_url,
  };
}

export async function listEvents(): Promise<EventItem[]> {
  const { data, error } = await supabase.from('events').select(SELECT).order('start_at');
  if (error) throw error;
  return (data as Row[]).map(mapRow);
}

export async function listUpcomingEvents(): Promise<EventItem[]> {
  const { data, error } = await supabase
    .from('events')
    .select(SELECT)
    .gte('start_at', new Date().toISOString())
    .order('start_at')
    .limit(10);
  if (error) throw error;
  return (data as Row[]).map(mapRow);
}

export async function getEventById(id: string): Promise<EventItem | null> {
  const { data, error } = await supabase.from('events').select(SELECT).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as Row) : null;
}

export async function registerForEvent(input: {
  eventId: string;
  userId: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
}): Promise<void> {
  const { error } = await supabase
    .from('event_registrations')
    .upsert(
      {
        event_id: input.eventId,
        user_id: input.userId,
        full_name: input.fullName,
        email: input.email ?? null,
        phone: input.phone ?? null,
        status: 'registered',
      },
      { onConflict: 'event_id,user_id' },
    );
  if (error) throw error;
}

export async function getMyEventRegistration(eventId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
