export type Event = {
  id: string;
  title: string;
  isoDate: string;
  endIsoDate?: string;
  location: string;
  imageUrl?: string;
  registrationRequired: boolean;
  description: string;
  organiser: string;
};

const inDays = (days: number, hours = 9): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
};

export const EVENTS: Event[] = [
  {
    id: 'lewa-safari-marathon',
    title: 'Lewa Safari Marathon',
    isoDate: inDays(21, 6),
    endIsoDate: inDays(21, 12),
    location: 'Lewa HQ Start Line',
    imageUrl: 'https://images.unsplash.com/photo-1533450718592-29d45635f0a9?auto=format&fit=crop&w=1600&q=80',
    registrationRequired: true,
    description:
      'One of the world’s toughest marathons, run entirely through wildlife territory. Every entry directly funds conservation and community programmes.',
    organiser: 'Lewa Wildlife Conservancy',
  },
  {
    id: 'wildlife-photography-workshop',
    title: 'Wildlife Photography Workshop',
    isoDate: inDays(8, 15),
    endIsoDate: inDays(10, 17),
    location: 'Lewa House Learning Room',
    registrationRequired: true,
    description:
      'A three-day workshop with two award-winning photographers covering ethical wildlife photography, composition and post-processing.',
    organiser: 'Lewa Education Programme',
  },
  {
    id: 'ranger-open-day',
    title: 'Ranger Open Day',
    isoDate: inDays(3, 10),
    location: 'Rhino Monitoring Base',
    imageUrl:
      'https://images.unsplash.com/photo-1516934024742-b461fba47600?auto=format&fit=crop&w=1600&q=80',
    registrationRequired: false,
    description:
      'Meet the anti-poaching team, tour the operations centre and see how technology protects wildlife 24/7.',
    organiser: 'Lewa Security Team',
  },
  {
    id: 'community-tree-planting',
    title: 'Community Tree Planting',
    isoDate: inDays(14, 8),
    location: 'Ntugi Village',
    registrationRequired: true,
    description:
      'Join community volunteers planting 3,000 indigenous seedlings along Lewa’s eastern boundary. Transport and lunch included.',
    organiser: 'Community Development Programme',
  },
];

export function getEventById(id: string): Event | undefined {
  return EVENTS.find((e) => e.id === id);
}

export function upcomingEvents(): Event[] {
  const now = Date.now();
  return EVENTS.filter((e) => new Date(e.isoDate).getTime() >= now).sort(
    (a, b) => new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime(),
  );
}
