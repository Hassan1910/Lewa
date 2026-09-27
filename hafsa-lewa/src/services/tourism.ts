import { supabase } from '@/lib/supabase';
import type { TourismPricingUnit, TourismService } from '@/services/types';

const SELECT =
  'id, title, category, service_type, summary, description, highlights, includes, meeting_point, duration_label, capacity, price, currency, pricing_unit, image_url, hero_image_url, featured';

type Row = {
  id: string;
  title: string;
  category: string;
  service_type: string | null;
  summary: string | null;
  description: string | null;
  highlights: string[] | null;
  includes: string[] | null;
  meeting_point: string | null;
  duration_label: string | null;
  capacity: number;
  price: number | string;
  currency: string;
  pricing_unit: TourismPricingUnit;
  image_url: string | null;
  hero_image_url: string | null;
  featured: boolean;
};

function mapRow(r: Row): TourismService {
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    serviceType: r.service_type,
    summary: r.summary,
    description: r.description,
    highlights: r.highlights ?? [],
    includes: r.includes ?? [],
    meetingPoint: r.meeting_point,
    durationLabel: r.duration_label,
    capacity: r.capacity,
    price: Number(r.price),
    currency: r.currency,
    pricingUnit: r.pricing_unit,
    imageUrl: r.image_url,
    heroImageUrl: r.hero_image_url,
    featured: r.featured,
  };
}

export async function listTourism(): Promise<TourismService[]> {
  const { data, error } = await supabase
    .from('tourism_services')
    .select(SELECT)
    .order('featured', { ascending: false })
    .order('title');
  if (error) throw error;
  return (data as Row[]).map(mapRow);
}

export async function listFeaturedTourism(): Promise<TourismService[]> {
  const { data, error } = await supabase
    .from('tourism_services')
    .select(SELECT)
    .eq('featured', true)
    .order('title');
  if (error) throw error;
  return (data as Row[]).map(mapRow);
}

export async function getTourismById(id: string): Promise<TourismService | null> {
  const { data, error } = await supabase.from('tourism_services').select(SELECT).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as Row) : null;
}

export function calculateTourismTotal(service: TourismService, guests: number): number {
  return service.pricingUnit === 'per_guest' ? service.price * guests : service.price;
}

export function getTourismPricingLabel(service: TourismService): string {
  if (service.pricingUnit === 'per_booking') {
    return service.durationLabel?.startsWith('per ') ? service.durationLabel : 'per booking';
  }
  return 'per guest';
}

export function getTourismPriceCaption(service: TourismService): string {
  const pricingLabel = getTourismPricingLabel(service);
  if (service.durationLabel?.startsWith('per ')) return pricingLabel;
  return service.durationLabel ? `${service.durationLabel} · ${pricingLabel}` : pricingLabel;
}
