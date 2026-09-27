export type ConservationProgram = {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  category: 'Wildlife' | 'Community' | 'Habitat' | 'Research';
};

export const CONSERVATION_PROGRAMS: ConservationProgram[] = [
  {
    id: 'anti-poaching',
    title: 'Anti-poaching Operations',
    summary: '24/7 field patrols, rapid response, canine unit and aerial surveillance.',
    imageUrl:
      'https://images.unsplash.com/photo-1516934024742-b461fba47600?auto=format&fit=crop&w=1200&q=80',
    category: 'Wildlife',
  },
  {
    id: 'community-health',
    title: 'Community Health',
    summary: 'Four clinics serving 40,000 neighbours with maternal, child and preventive care.',
    imageUrl:
      'https://images.unsplash.com/photo-1519824145371-296894a0daa9?auto=format&fit=crop&w=1200&q=80',
    category: 'Community',
  },
  {
    id: 'wildlife-corridors',
    title: 'Wildlife Corridors',
    summary: 'Protecting the elephant corridor that links Lewa to Mount Kenya National Park.',
    imageUrl:
      'https://images.unsplash.com/photo-1509909756405-be0199881695?auto=format&fit=crop&w=1200&q=80',
    category: 'Habitat',
  },
  {
    id: 'research-monitoring',
    title: 'Research & Monitoring',
    summary: 'Long-term studies of rhino, Grevy’s zebra and predator populations.',
    imageUrl:
      'https://images.unsplash.com/photo-1567859667906-bafa2c14b4f2?auto=format&fit=crop&w=1200&q=80',
    category: 'Research',
  },
];
