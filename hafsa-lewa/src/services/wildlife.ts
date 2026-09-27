import { supabase } from '@/lib/supabase';
import type { WildlifeSpecies } from '@/services/types';

const SELECT = 'id, name, scientific_name, category, conservation_status, description, habitat, behavior, facts, image_url, hero_image_url, featured';

type Row = {
  id: string;
  name: string;
  scientific_name: string | null;
  category: string;
  conservation_status: string | null;
  description: string | null;
  habitat: string | null;
  behavior: string | null;
  facts: string[] | null;
  image_url: string | null;
  hero_image_url: string | null;
  featured: boolean;
};

function mapRow(r: Row): WildlifeSpecies {
  return {
    id: r.id,
    name: r.name,
    scientificName: r.scientific_name,
    category: r.category,
    conservationStatus: r.conservation_status,
    description: r.description,
    habitat: r.habitat,
    behavior: r.behavior,
    facts: r.facts ?? [],
    imageUrl: r.image_url,
    heroImageUrl: r.hero_image_url,
    featured: r.featured,
  };
}

export async function listWildlife(): Promise<WildlifeSpecies[]> {
  const { data, error } = await supabase
    .from('wildlife_species')
    .select(SELECT)
    .order('featured', { ascending: false })
    .order('name');
  if (error) throw error;
  return (data as Row[]).map(mapRow);
}

export async function listFeaturedWildlife(): Promise<WildlifeSpecies[]> {
  const { data, error } = await supabase
    .from('wildlife_species')
    .select(SELECT)
    .eq('featured', true)
    .order('name');
  if (error) throw error;
  return (data as Row[]).map(mapRow);
}

export async function getWildlifeById(id: string): Promise<WildlifeSpecies | null> {
  const { data, error } = await supabase.from('wildlife_species').select(SELECT).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as Row) : null;
}
