export type ConservationStatus =
  | 'Least Concern'
  | 'Near Threatened'
  | 'Vulnerable'
  | 'Endangered'
  | 'Critically Endangered';

export type WildlifeCategory = 'Mammals' | 'Birds' | 'Reptiles' | 'Predators';

export type WildlifeSpecies = {
  id: string;
  name: string;
  scientificName: string;
  category: WildlifeCategory;
  conservationStatus: ConservationStatus;
  imageUrl: string;
  heroImageUrl: string;
  featured: boolean;
  description: string;
  habitat: string;
  behavior: string;
  facts: string[];
};

export const WILDLIFE: WildlifeSpecies[] = [
  {
    id: 'grevys-zebra',
    name: 'Grevy’s Zebra',
    scientificName: 'Equus grevyi',
    category: 'Mammals',
    conservationStatus: 'Endangered',
    imageUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80',
    heroImageUrl:
      'https://images.unsplash.com/photo-1516934024742-b461fba47600?auto=format&fit=crop&w=1600&q=80',
    featured: true,
    description:
      'The largest of the wild equids and one of the most threatened. Lewa protects roughly 14% of the world’s remaining Grevy’s zebra population.',
    habitat: 'Semi-arid grasslands and acacia scrub of northern Kenya.',
    behavior:
      'Territorial stallions defend water sources; females and foals move between territories in small groups.',
    facts: [
      'Distinguished by narrower stripes and a white belly.',
      'Population has declined more than 50% in three decades.',
      'Lewa runs community scout programs to protect calving grounds.',
    ],
  },
  {
    id: 'black-rhino',
    name: 'Black Rhino',
    scientificName: 'Diceros bicornis',
    category: 'Mammals',
    conservationStatus: 'Critically Endangered',
    imageUrl: 'https://images.unsplash.com/photo-1567859667906-bafa2c14b4f2?auto=format&fit=crop&w=1200&q=80',
    heroImageUrl:
      'https://images.unsplash.com/photo-1518709414768-a88981a4515d?auto=format&fit=crop&w=1600&q=80',
    featured: true,
    description:
      'A browsing rhinoceros with a hooked upper lip. Lewa is a black-rhino stronghold in northern Kenya.',
    habitat: 'Dense bushland and forest edges within the conservancy.',
    behavior: 'Solitary and mostly nocturnal, with excellent sense of smell and hearing.',
    facts: [
      'Every rhino at Lewa is monitored 24/7 by rangers.',
      'Lewa has not lost a rhino to poaching in multiple recent years thanks to intensive protection.',
      'Newborn calves stay with their mothers for 2–3 years.',
    ],
  },
  {
    id: 'reticulated-giraffe',
    name: 'Reticulated Giraffe',
    scientificName: 'Giraffa reticulata',
    category: 'Mammals',
    conservationStatus: 'Endangered',
    imageUrl: 'https://images.unsplash.com/photo-1547721064-da6cfb341d50?auto=format&fit=crop&w=1200&q=80',
    heroImageUrl:
      'https://images.unsplash.com/photo-1534567110243-8875d64ca8ff?auto=format&fit=crop&w=1600&q=80',
    featured: true,
    description:
      'Recognisable by its striking web-like coat pattern, the reticulated giraffe is only found in the Horn of Africa.',
    habitat: 'Open woodland and savannah with abundant acacia.',
    behavior: 'Browses on high foliage; forms loose herds that shift throughout the day.',
    facts: [
      'Lewa surveys giraffe populations each year using photo-ID.',
      'Population has dropped by more than half across its range.',
    ],
  },
  {
    id: 'african-elephant',
    name: 'African Elephant',
    scientificName: 'Loxodonta africana',
    category: 'Mammals',
    conservationStatus: 'Endangered',
    imageUrl: 'https://images.unsplash.com/photo-1509909756405-be0199881695?auto=format&fit=crop&w=1200&q=80',
    heroImageUrl:
      'https://images.unsplash.com/photo-1547721064-da6cfb341d50?auto=format&fit=crop&w=1600&q=80',
    featured: false,
    description:
      'Lewa forms part of a critical wildlife corridor linking Mount Kenya to the Ngare Ndare Forest, used by elephant families year-round.',
    habitat: 'Wooded savannah, riverine forest and the Mount Kenya foothills.',
    behavior: 'Matriarchal families of related females and their calves; bulls roam more widely.',
    facts: [
      'Elephants use the underpass beneath the A2 highway to reach Mount Kenya.',
      'Herd sizes at Lewa can exceed 60 individuals in dry months.',
    ],
  },
  {
    id: 'lion',
    name: 'Lion',
    scientificName: 'Panthera leo',
    category: 'Predators',
    conservationStatus: 'Vulnerable',
    imageUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80',
    heroImageUrl:
      'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1600&q=80',
    featured: false,
    description:
      'Apex predator across Lewa’s plains. Prides are monitored to reduce conflict with neighbouring livestock.',
    habitat: 'Open plains and rocky kopjes across the conservancy.',
    behavior: 'Social predators; females do most of the hunting cooperatively.',
    facts: [
      'Individual lions are identified by their whisker spot pattern.',
      'Lewa works with communities to compensate for occasional livestock losses.',
    ],
  },
  {
    id: 'african-wild-dog',
    name: 'African Wild Dog',
    scientificName: 'Lycaon pictus',
    category: 'Predators',
    conservationStatus: 'Endangered',
    imageUrl: 'https://images.unsplash.com/photo-1502248103506-76afc15f5c45?auto=format&fit=crop&w=1200&q=80',
    heroImageUrl:
      'https://images.unsplash.com/photo-1502248103506-76afc15f5c45?auto=format&fit=crop&w=1600&q=80',
    featured: false,
    description:
      'One of Africa’s most endangered carnivores. Packs range across northern Kenya, moving in and out of Lewa.',
    habitat: 'Open woodland and mixed savannah with low human density.',
    behavior: 'Highly social packs led by an alpha pair; efficient cooperative hunters.',
    facts: [
      'No two individuals share the same coat pattern.',
      'Packs can travel more than 20km in a single day.',
    ],
  },
  {
    id: 'kori-bustard',
    name: 'Kori Bustard',
    scientificName: 'Ardeotis kori',
    category: 'Birds',
    conservationStatus: 'Near Threatened',
    imageUrl: 'https://images.unsplash.com/photo-1516934024742-b461fba47600?auto=format&fit=crop&w=1200&q=80',
    heroImageUrl:
      'https://images.unsplash.com/photo-1516934024742-b461fba47600?auto=format&fit=crop&w=1600&q=80',
    featured: false,
    description:
      'One of the heaviest flying birds. Regularly seen striding across Lewa’s open plains.',
    habitat: 'Short grass plains and lightly wooded savannah.',
    behavior: 'Mostly terrestrial; males perform dramatic breeding displays.',
    facts: [
      'Adult males can weigh over 18kg.',
      'Feeds opportunistically on insects, small reptiles and seeds.',
    ],
  },
];

export function getWildlifeById(id: string): WildlifeSpecies | undefined {
  return WILDLIFE.find((w) => w.id === id);
}

export function getFeaturedWildlife(): WildlifeSpecies[] {
  return WILDLIFE.filter((w) => w.featured);
}

export const WILDLIFE_CATEGORIES: WildlifeCategory[] = [
  'Mammals',
  'Predators',
  'Birds',
  'Reptiles',
];
