import { EDUCATION_ARTICLES } from '@/data/mock/education';
import { EVENTS } from '@/data/mock/events';
import { TOURISM } from '@/data/mock/tourism';
import { WILDLIFE } from '@/data/mock/wildlife';

export type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  type: 'wildlife' | 'tourism' | 'event' | 'education';
  href: string;
  imageUrl?: string;
};

export function searchAll(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: SearchResult[] = [];

  for (const w of WILDLIFE) {
    if (
      w.name.toLowerCase().includes(q) ||
      w.scientificName.toLowerCase().includes(q) ||
      w.description.toLowerCase().includes(q)
    ) {
      results.push({
        id: `wildlife-${w.id}`,
        title: w.name,
        subtitle: w.scientificName,
        type: 'wildlife',
        href: `/wildlife/${w.id}`,
        imageUrl: w.imageUrl,
      });
    }
  }

  for (const t of TOURISM) {
    if (
      t.title.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    ) {
      results.push({
        id: `tourism-${t.id}`,
        title: t.title,
        subtitle: t.category,
        type: 'tourism',
        href: `/tourism/${t.id}`,
        imageUrl: t.imageUrl,
      });
    }
  }

  for (const e of EVENTS) {
    if (
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q)
    ) {
      results.push({
        id: `event-${e.id}`,
        title: e.title,
        subtitle: e.location,
        type: 'event',
        href: `/events/${e.id}`,
        imageUrl: e.imageUrl,
      });
    }
  }

  for (const a of EDUCATION_ARTICLES) {
    if (a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q)) {
      results.push({
        id: `edu-${a.id}`,
        title: a.title,
        subtitle: `${a.category} · ${a.readingMinutes} min read`,
        type: 'education',
        href: `/education`,
        imageUrl: a.imageUrl,
      });
    }
  }

  return results;
}
