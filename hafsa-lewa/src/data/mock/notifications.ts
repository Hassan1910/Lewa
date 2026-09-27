export type NotificationType =
  | 'wildlife_sighting'
  | 'conservation_announcement'
  | 'event_reminder'
  | 'booking_status'
  | 'payment_confirmation'
  | 'donation_confirmation'
  | 'general_announcement';

export type Notification = {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  isoDate: string;
  unread: boolean;
  deepLink?: string;
};

const hoursAgo = (h: number): string => {
  const d = new Date();
  d.setHours(d.getHours() - h);
  return d.toISOString();
};

export const NOTIFICATIONS: Notification[] = [
  {
    id: 'n-001',
    title: 'Rhino calf spotted',
    body: 'A new black-rhino calf was recorded by the monitoring team this morning.',
    type: 'wildlife_sighting',
    isoDate: hoursAgo(2),
    unread: true,
  },
  {
    id: 'n-002',
    title: 'Booking confirmed',
    body: 'Your Sunrise Game Drive on Saturday is confirmed. Meet at HQ 5:30am.',
    type: 'booking_status',
    isoDate: hoursAgo(9),
    unread: true,
    deepLink: '/bookings',
  },
  {
    id: 'n-003',
    title: 'Marathon registration open',
    body: 'Places for the Lewa Safari Marathon are now open. Places always sell out.',
    type: 'event_reminder',
    isoDate: hoursAgo(26),
    unread: false,
    deepLink: '/events/lewa-safari-marathon',
  },
  {
    id: 'n-004',
    title: 'Thank you for your donation',
    body: 'Your $50 gift to Protect a Rhino funds a full day of ranger patrol fuel.',
    type: 'donation_confirmation',
    isoDate: hoursAgo(52),
    unread: false,
  },
  {
    id: 'n-005',
    title: 'Corridor update',
    body: 'The Mount Kenya elephant corridor recorded 34 individuals passing through this week.',
    type: 'conservation_announcement',
    isoDate: hoursAgo(96),
    unread: false,
  },
];

export function unreadCount(): number {
  return NOTIFICATIONS.filter((n) => n.unread).length;
}
