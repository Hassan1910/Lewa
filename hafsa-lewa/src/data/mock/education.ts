export type EducationArticle = {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  category: 'Wildlife' | 'Conservation' | 'Community';
  readingMinutes: number;
};

export const EDUCATION_ARTICLES: EducationArticle[] = [
  {
    id: 'e-01',
    title: 'Why the Grevy’s zebra matters',
    summary: 'Understanding the biology, threats and hope for the world’s most endangered zebra.',
    imageUrl:
      'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80',
    category: 'Wildlife',
    readingMinutes: 6,
  },
  {
    id: 'e-02',
    title: 'How Lewa protects a rhino',
    summary: 'Step inside the operations centre that keeps every rhino safe, 24 hours a day.',
    imageUrl:
      'https://images.unsplash.com/photo-1567859667906-bafa2c14b4f2?auto=format&fit=crop&w=1200&q=80',
    category: 'Conservation',
    readingMinutes: 8,
  },
  {
    id: 'e-03',
    title: 'The Mount Kenya elephant corridor',
    summary: 'The story of how a fence, an underpass and a community made history for wildlife.',
    imageUrl:
      'https://images.unsplash.com/photo-1509909756405-be0199881695?auto=format&fit=crop&w=1200&q=80',
    category: 'Conservation',
    readingMinutes: 7,
  },
  {
    id: 'e-04',
    title: 'Living alongside wildlife',
    summary: 'How Lewa’s community programmes turn conservation into shared opportunity.',
    imageUrl:
      'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80',
    category: 'Community',
    readingMinutes: 5,
  },
];
