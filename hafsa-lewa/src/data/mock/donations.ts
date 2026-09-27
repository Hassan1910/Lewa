export type DonationCampaign = {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  goalUSD: number;
  raisedUSD: number;
  storyParagraphs: string[];
  impact: { amountUSD: number; description: string }[];
  suggestedAmountsUSD: number[];
  active: boolean;
};

export const DONATIONS: DonationCampaign[] = [
  {
    id: 'protect-a-rhino',
    title: 'Protect a Rhino',
    summary: 'Fund 24-hour anti-poaching for Lewa’s critically endangered black rhino.',
    imageUrl: 'https://images.unsplash.com/photo-1567859667906-bafa2c14b4f2?auto=format&fit=crop&w=1600&q=80',
    goalUSD: 250000,
    raisedUSD: 187400,
    storyParagraphs: [
      'Lewa is one of the largest black rhino sanctuaries in East Africa. Every rhino here is monitored 24/7.',
      'Your donation directly funds ranger patrols, veterinary care and the tracking technology that keeps this population safe.',
    ],
    impact: [
      { amountUSD: 25, description: 'One day of GPS tracker uptime for a rhino monitoring team.' },
      { amountUSD: 100, description: 'Fuel and provisions for a full ranger patrol.' },
      { amountUSD: 500, description: 'Two-week ration for a K9 anti-poaching dog.' },
    ],
    suggestedAmountsUSD: [25, 50, 100, 250],
    active: true,
  },
  {
    id: 'community-scholarships',
    title: 'Community Scholarships',
    summary: 'Send a student from a Lewa neighbouring community to secondary school.',
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80',
    goalUSD: 60000,
    raisedUSD: 42300,
    storyParagraphs: [
      'Lewa funds full scholarships for high-achieving students from surrounding communities.',
      'Alumni have gone on to become doctors, lawyers, teachers and conservationists — many returning to work with the conservancy.',
    ],
    impact: [
      { amountUSD: 60, description: 'One month of full boarding fees for a secondary school student.' },
      { amountUSD: 250, description: 'A full term of tuition, meals and accommodation.' },
      { amountUSD: 1000, description: 'An entire academic year for one student.' },
    ],
    suggestedAmountsUSD: [50, 100, 250, 500],
    active: true,
  },
  {
    id: 'wildlife-corridors',
    title: 'Wildlife Corridors',
    summary: 'Keep the underpass and forest linkage open for elephants moving to Mount Kenya.',
    imageUrl: 'https://images.unsplash.com/photo-1509909756405-be0199881695?auto=format&fit=crop&w=1600&q=80',
    goalUSD: 150000,
    raisedUSD: 32000,
    storyParagraphs: [
      'The Mount Kenya elephant corridor connects Lewa to Africa’s second-highest peak.',
      'Ongoing maintenance and community stewardship keep the route safe for elephants and other wildlife.',
    ],
    impact: [
      { amountUSD: 40, description: 'One week of maintenance on the corridor fence line.' },
      { amountUSD: 200, description: 'A month of monitoring by a corridor scout.' },
    ],
    suggestedAmountsUSD: [40, 100, 200, 500],
    active: true,
  },
];

export function getCampaignById(id: string): DonationCampaign | undefined {
  return DONATIONS.find((c) => c.id === id);
}

export function activeCampaigns(): DonationCampaign[] {
  return DONATIONS.filter((c) => c.active);
}
