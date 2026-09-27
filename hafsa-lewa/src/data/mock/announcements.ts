export type Announcement = {
  id: string;
  title: string;
  body: string;
  isoDate: string;
  tone: 'default' | 'urgent';
};

const hoursAgo = (h: number): string => {
  const d = new Date();
  d.setHours(d.getHours() - h);
  return d.toISOString();
};

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a-001',
    title: 'Rangers rescue snared elephant',
    body: 'Our security and veterinary teams safely removed a snare from a young bull elephant near the Ngare Ndare corridor.',
    isoDate: hoursAgo(6),
    tone: 'default',
  },
  {
    id: 'a-002',
    title: 'Northern gate closure',
    body: 'The northern gate is closed for maintenance until Friday. Please use the main gate for entry.',
    isoDate: hoursAgo(20),
    tone: 'urgent',
  },
  {
    id: 'a-003',
    title: 'Corridor use hits five-year high',
    body: 'Camera-trap data shows elephant use of the Mount Kenya corridor is up 38% year on year.',
    isoDate: hoursAgo(48),
    tone: 'default',
  },
];
