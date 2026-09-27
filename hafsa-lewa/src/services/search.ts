import { supabase } from '@/lib/supabase';

export type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  type: 'wildlife' | 'tourism' | 'event' | 'education';
  href: string;
  imageUrl?: string | null;
};

/**
 * Runs an ilike query per content table in parallel. Keeps the surface simple
 * (no full-text search) but returns a unified list ready for the results view.
 */
export async function searchAll(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q) return [];
  const pattern = `%${q}%`;

  const [wildlife, tourism, events, education] = await Promise.all([
    supabase
      .from('wildlife_species')
      .select('id, name, scientific_name, image_url')
      .or(`name.ilike.${pattern},scientific_name.ilike.${pattern},description.ilike.${pattern}`)
      .limit(10),
    supabase
      .from('tourism_services')
      .select('id, title, category, image_url')
      .or(`title.ilike.${pattern},summary.ilike.${pattern},category.ilike.${pattern}`)
      .limit(10),
    supabase
      .from('events')
      .select('id, title, location, image_url')
      .or(`title.ilike.${pattern},description.ilike.${pattern},location.ilike.${pattern}`)
      .limit(10),
    supabase
      .from('education_resources')
      .select('id, title, category, cover_image, reading_minutes')
      .or(`title.ilike.${pattern},summary.ilike.${pattern}`)
      .limit(10),
  ]);

  const results: SearchResult[] = [];

  for (const w of (wildlife.data ?? []) as Array<{ id: string; name: string; scientific_name: string | null; image_url: string | null }>) {
    results.push({
      id: `wildlife-${w.id}`,
      title: w.name,
      subtitle: w.scientific_name ?? 'Wildlife',
      type: 'wildlife',
      href: `/wildlife/${w.id}`,
      imageUrl: w.image_url,
    });
  }

  for (const t of (tourism.data ?? []) as Array<{ id: string; title: string; category: string; image_url: string | null }>) {
    results.push({
      id: `tourism-${t.id}`,
      title: t.title,
      subtitle: t.category,
      type: 'tourism',
      href: `/tourism/${t.id}`,
      imageUrl: t.image_url,
    });
  }

  for (const e of (events.data ?? []) as Array<{ id: string; title: string; location: string | null; image_url: string | null }>) {
    results.push({
      id: `event-${e.id}`,
      title: e.title,
      subtitle: e.location ?? 'Event',
      type: 'event',
      href: `/events/${e.id}`,
      imageUrl: e.image_url,
    });
  }

  for (const a of (education.data ?? []) as Array<{ id: string; title: string; category: string | null; cover_image: string | null; reading_minutes: number | null }>) {
    results.push({
      id: `edu-${a.id}`,
      title: a.title,
      subtitle: `${a.category ?? 'Article'}${a.reading_minutes ? ` · ${a.reading_minutes} min read` : ''}`,
      type: 'education',
      href: `/education`,
      imageUrl: a.cover_image,
    });
  }

  return results;
}
