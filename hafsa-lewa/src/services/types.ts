// Domain types used across the mobile app. These map 1:1 to the Supabase
// tables defined in supabase/migrations/*. Monetary amounts are always in the
// currency stored on the row (KES by default).

export type ConservationStatus =
  | 'Least Concern'
  | 'Near Threatened'
  | 'Vulnerable'
  | 'Endangered'
  | 'Critically Endangered';

export type WildlifeCategory = string;

export type WildlifeSpecies = {
  id: string;
  name: string;
  scientificName: string | null;
  category: WildlifeCategory;
  conservationStatus: ConservationStatus | string | null;
  description: string | null;
  habitat: string | null;
  behavior: string | null;
  facts: string[];
  imageUrl: string | null;
  heroImageUrl: string | null;
  featured: boolean;
};

export type TourismCategory = string;
export type TourismPricingUnit = 'per_guest' | 'per_booking';

export type TourismService = {
  id: string;
  title: string;
  category: TourismCategory;
  serviceType: string | null;
  summary: string | null;
  description: string | null;
  highlights: string[];
  includes: string[];
  meetingPoint: string | null;
  durationLabel: string | null;
  capacity: number;
  price: number;
  currency: string;
  pricingUnit: TourismPricingUnit;
  imageUrl: string | null;
  heroImageUrl: string | null;
  featured: boolean;
};

export type EventItem = {
  id: string;
  title: string;
  description: string | null;
  eventType: string | null;
  startAt: string; // ISO
  endAt: string | null;
  location: string | null;
  organiser: string | null;
  capacity: number | null;
  registrationRequired: boolean;
  imageUrl: string | null;
};

export type DonationImpact = { amount: number; description: string };

export type DonationCampaign = {
  id: string;
  title: string;
  summary: string | null;
  description: string | null;
  storyParagraphs: string[];
  impact: DonationImpact[];
  suggestedAmounts: number[];
  goalAmount: number;
  amountRaised: number;
  currency: string;
  coverImage: string | null;
  active: boolean;
};

export type BookingStatus =
  | 'draft'
  | 'pending_payment'
  | 'payment_verification'
  | 'confirmed'
  | 'pending_review'
  | 'cancelled'
  | 'completed'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'success'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export type Booking = {
  id: string;
  reference: string;
  userId: string | null;
  serviceId: string;
  serviceTitle: string;
  imageUrl: string | null;
  bookingDate: string; // ISO
  guests: number;
  amount: number;
  currency: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
};

export type BookingGuest = {
  fullName: string;
  email: string | null;
  phone: string | null;
};

export type BookingDetail = Booking & {
  specialRequests: string | null;
  meetingPoint: string | null;
  leadGuest: BookingGuest | null;
};

export type ConservationProgram = {
  id: string;
  title: string;
  summary: string | null;
  description: string | null;
  category: string | null;
  coverImage: string | null;
};

export type EducationResource = {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  category: string | null;
  coverImage: string | null;
  readingMinutes: number | null;
};

export type CommunityProgram = {
  id: string;
  title: string;
  summary: string | null;
  description: string | null;
  location: string | null;
  coverImage: string | null;
  sortOrder: number;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  tone: 'default' | 'urgent';
  publishAt: string;
  priority: number;
};

export type Faq = {
  id: string;
  category: string;
  question: string;
  answer: string;
  sortOrder: number;
};

export type AboutSection = {
  key: string;
  title: string;
  body: string;
  sortOrder: number;
};

export type NotificationType =
  | 'wildlife_sighting'
  | 'conservation_announcement'
  | 'event_reminder'
  | 'booking_status'
  | 'payment_confirmation'
  | 'donation_confirmation'
  | 'general_announcement';

export type AppNotification = {
  id: string;
  userId: string | null;
  title: string;
  body: string;
  type: NotificationType;
  data: Record<string, unknown>;
  deepLink: string | null;
  broadcast: boolean;
  readAt: string | null;
  createdAt: string;
};

export type NotificationPreferences = {
  userId: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
  wildlifeSightings: boolean;
  bookingUpdates: boolean;
  eventReminders: boolean;
  donationReceipts: boolean;
  conservationNews: boolean;
};
