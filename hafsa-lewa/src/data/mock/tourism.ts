export type TourismCategory =
  | 'Safari'
  | 'Guided Tour'
  | 'Accommodation'
  | 'Conservation Activity'
  | 'Community Experience';

export type TourismService = {
  id: string;
  title: string;
  category: TourismCategory;
  imageUrl: string;
  heroImageUrl: string;
  priceUSD: number;
  durationLabel: string;
  featured: boolean;
  summary: string;
  description: string;
  highlights: string[];
  capacity: number;
  includes: string[];
  meetingPoint: string;
};

export const TOURISM: TourismService[] = [
  {
    id: 'sunrise-game-drive',
    title: 'Sunrise Game Drive',
    category: 'Safari',
    imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
    heroImageUrl:
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=80',
    priceUSD: 145,
    durationLabel: '3 hrs',
    featured: true,
    summary: 'Head out at dawn with a Lewa guide to spot Grevy’s zebra, giraffe and rhino.',
    description:
      'Meet at HQ before first light and board a 4x4 to explore the northern plains during the most active wildlife hours. Coffee and light snacks provided.',
    highlights: [
      'Small group of up to 6 guests per vehicle',
      'Led by a KPSGA-certified silver-level guide',
      'Best light for photography and rare species',
    ],
    capacity: 6,
    includes: ['Guide', 'Vehicle', 'Coffee and snacks', 'Park fees'],
    meetingPoint: 'Lewa HQ car park',
  },
  {
    id: 'rhino-tracking-walk',
    title: 'Rhino Tracking Walk',
    category: 'Conservation Activity',
    imageUrl: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1200&q=80',
    heroImageUrl:
      'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1600&q=80',
    priceUSD: 220,
    durationLabel: '4 hrs',
    featured: true,
    summary: 'Join a monitoring team on foot as they track a black rhino using field telemetry.',
    description:
      'Walk alongside our rhino monitors while they collect the daily sighting records used to protect Lewa’s critically endangered rhino population.',
    highlights: [
      'Guided by a rhino monitoring officer',
      'Learn how radio telemetry protects wildlife',
      'Minimum age 14 for safety',
    ],
    capacity: 4,
    includes: ['Guide', 'Ranger escort', 'Water', 'Field notebook'],
    meetingPoint: 'Rhino monitoring base',
  },
  {
    id: 'lewa-safari-camp',
    title: 'Lewa Safari Camp — Tented Suite',
    category: 'Accommodation',
    imageUrl: 'https://images.unsplash.com/photo-1470004914212-05527e49370b?auto=format&fit=crop&w=1200&q=80',
    heroImageUrl:
      'https://images.unsplash.com/photo-1470004914212-05527e49370b?auto=format&fit=crop&w=1600&q=80',
    priceUSD: 480,
    durationLabel: 'per night',
    featured: true,
    summary: 'Full-board tented suite with private veranda overlooking the plains.',
    description:
      'Nine luxury tented suites nestled in indigenous acacia trees, each with private veranda and en-suite bathroom. Rates include all meals, house drinks and two daily activities.',
    highlights: [
      'Full board with dining under the stars',
      'Two guided activities per day included',
      'A share of every booking supports the conservancy',
    ],
    capacity: 2,
    includes: ['Full board', 'House drinks', 'Two daily activities', 'Conservancy fees'],
    meetingPoint: 'Lewa Safari Camp reception',
  },
  {
    id: 'community-market-visit',
    title: 'Community Market Visit',
    category: 'Community Experience',
    imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80',
    heroImageUrl:
      'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1600&q=80',
    priceUSD: 65,
    durationLabel: '2 hrs',
    featured: false,
    summary: 'Meet artisans from the neighbouring communities Lewa partners with.',
    description:
      'Travel to a nearby community trading centre, learn about the Ntugi women’s enterprise and shop for handmade beadwork straight from the makers.',
    highlights: [
      'Directly supports local livelihoods',
      'Guided by a community liaison officer',
      'Small group experience',
    ],
    capacity: 8,
    includes: ['Guide', 'Transport', 'Refreshments'],
    meetingPoint: 'Lewa HQ car park',
  },
  {
    id: 'guided-nature-walk',
    title: 'Guided Nature Walk',
    category: 'Guided Tour',
    imageUrl: 'https://images.unsplash.com/photo-1533450718592-29d45635f0a9?auto=format&fit=crop&w=1200&q=80',
    heroImageUrl:
      'https://images.unsplash.com/photo-1533450718592-29d45635f0a9?auto=format&fit=crop&w=1600&q=80',
    priceUSD: 95,
    durationLabel: '2.5 hrs',
    featured: false,
    summary: 'Slow-paced walk focused on birdlife, tracks and medicinal plants.',
    description:
      'A guided walking safari across the plains with an armed ranger and specialist naturalist. Ideal for photographers and birders.',
    highlights: [
      'Excellent for birdwatchers',
      'Learn to read tracks and signs',
      'Minimum age 12',
    ],
    capacity: 6,
    includes: ['Guide', 'Ranger escort', 'Water'],
    meetingPoint: 'Lewa HQ car park',
  },
  {
    id: 'ngare-ndare-forest-day-trip',
    title: 'Ngare Ndare Forest Day Trip',
    category: 'Guided Tour',
    imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80',
    heroImageUrl:
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1600&q=80',
    priceUSD: 175,
    durationLabel: '6 hrs',
    featured: false,
    summary: 'Swim in blue pools and walk the elevated canopy walkway.',
    description:
      'A full-day excursion into the community-managed Ngare Ndare Forest, adjacent to Lewa. Includes lunch and canopy walkway access.',
    highlights: [
      'Canopy walkway 40m above the forest floor',
      'Swim in the sapphire-blue Ngare Ndare pools',
      'Includes packed lunch',
    ],
    capacity: 8,
    includes: ['Guide', 'Transport', 'Lunch', 'Forest access fee'],
    meetingPoint: 'Lewa HQ car park',
  },
];

export function getTourismById(id: string): TourismService | undefined {
  return TOURISM.find((s) => s.id === id);
}

export function getFeaturedTourism(): TourismService[] {
  return TOURISM.filter((s) => s.featured);
}

/** Accommodation is priced per suite/booking; experiences are per guest. */
export type TourismPricingUnit = 'per_guest' | 'per_booking';

export function getTourismPricingUnit(service: TourismService): TourismPricingUnit {
  return service.category === 'Accommodation' ? 'per_booking' : 'per_guest';
}

export function getTourismPricingLabel(service: TourismService): string {
  const unit = getTourismPricingUnit(service);
  if (unit === 'per_booking') {
    return service.durationLabel.startsWith('per ') ? service.durationLabel : 'per booking';
  }
  return 'per guest';
}

export function getTourismPriceCaption(service: TourismService): string {
  const pricingLabel = getTourismPricingLabel(service);
  if (service.durationLabel.startsWith('per ')) {
    return pricingLabel;
  }
  return `${service.durationLabel} · ${pricingLabel}`;
}

export function calculateTourismTotal(service: TourismService, guests: number): number {
  return getTourismPricingUnit(service) === 'per_guest'
    ? service.priceUSD * guests
    : service.priceUSD;
}

export const TOURISM_CATEGORIES: TourismCategory[] = [
  'Safari',
  'Guided Tour',
  'Conservation Activity',
  'Community Experience',
  'Accommodation',
];
