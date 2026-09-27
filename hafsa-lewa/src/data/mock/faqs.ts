export type FAQ = {
  id: string;
  category: 'General' | 'Bookings' | 'Payments' | 'Account';
  question: string;
  answer: string;
};

export const FAQS: FAQ[] = [
  {
    id: 'f-01',
    category: 'General',
    question: 'What is Lewa Wildlife Conservancy?',
    answer:
      'Lewa is a UNESCO World Heritage Site in northern Kenya that protects endangered species, safeguards ecosystems and supports neighbouring communities.',
  },
  {
    id: 'f-02',
    category: 'General',
    question: 'When is the best time to visit?',
    answer:
      'Lewa is a year-round destination. June to October and January to March typically offer the best wildlife viewing.',
  },
  {
    id: 'f-03',
    category: 'Bookings',
    question: 'How do I confirm my booking?',
    answer:
      'Your booking is confirmed once we receive payment. You will see the status update in the app and receive a confirmation email.',
  },
  {
    id: 'f-04',
    category: 'Bookings',
    question: 'What is your cancellation policy?',
    answer:
      'Free cancellation up to 72 hours before your booking. Within 72 hours, a 50% fee applies. No-shows are non-refundable.',
  },
  {
    id: 'f-05',
    category: 'Payments',
    question: 'Which payment methods are supported?',
    answer:
      'We support card and mobile-money payments through our secure payment partner. Confirmations are always verified server-side.',
  },
  {
    id: 'f-06',
    category: 'Account',
    question: 'How do I change my notification preferences?',
    answer:
      'Open the Profile tab, tap Notification preferences, then adjust which channels and topics you want to hear about.',
  },
];
