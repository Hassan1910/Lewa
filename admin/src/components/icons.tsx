import type { ReactNode } from 'react';

export type IconName =
  | 'grid'
  | 'users'
  | 'leaf'
  | 'compass'
  | 'calendar'
  | 'flag'
  | 'tree'
  | 'book'
  | 'people'
  | 'heart'
  | 'card'
  | 'bell'
  | 'message'
  | 'chart'
  | 'file'
  | 'gear'
  | 'list'
  | 'menu'
  | 'close';

const paths: Record<IconName, ReactNode> = {
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </>
  ),
  users: (
    <>
      <path d="M16 20v-1.2a3.2 3.2 0 0 0-3.2-3.2H7.2A3.2 3.2 0 0 0 4 18.8V20" />
      <circle cx="10" cy="8" r="3" />
      <path d="M20 20v-1.2a3.2 3.2 0 0 0-2.4-3.1" />
      <path d="M16 5.1a3 3 0 0 1 0 5.8" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19s2-9 9.5-12.5C18 5 20 4 20 4s-1 2-2.5 5.5C14.5 16 5 19 5 19Z" />
      <path d="M9 15c2-2 4.5-3.5 7-4.5" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m14.8 9.2-1.3 4.3-4.3 1.3 1.3-4.3 4.3-1.3Z" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M8 3.5V7M16 3.5V7M3.5 10h17" />
    </>
  ),
  flag: (
    <>
      <path d="M5 20V4" />
      <path d="M5 5h11l-2 3.5L16 12H5" />
    </>
  ),
  tree: (
    <>
      <path d="M12 21v-6" />
      <path d="M12 15 7 18h10L12 15Z" />
      <path d="M12 11 6.5 15h11L12 11Z" />
      <path d="M12 7 7 11.5h10L12 7Z" />
    </>
  ),
  book: (
    <>
      <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21.5Z" />
      <path d="M5 5.5A2.5 2.5 0 0 1 7.5 8H19" />
    </>
  ),
  people: (
    <>
      <circle cx="8" cy="9" r="2.2" />
      <circle cx="16" cy="9" r="2.2" />
      <path d="M3.8 18.5a4.2 4.2 0 0 1 8.4 0" />
      <path d="M11.8 18.5a4.2 4.2 0 0 1 8.4 0" />
    </>
  ),
  heart: (
    <path d="M12 19s-6.5-4.1-6.5-8.2A3.4 3.4 0 0 1 12 8.4a3.4 3.4 0 0 1 6.5 2.4C18.5 14.9 12 19 12 19Z" />
  ),
  card: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 15h4" />
    </>
  ),
  bell: (
    <>
      <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5L6 16Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  message: (
    <>
      <path d="M5 16.5 3.8 20l3.8-1.6A8.5 8.5 0 1 0 5 16.5Z" />
    </>
  ),
  chart: (
    <>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 16v-4" />
      <path d="M12 16V8" />
      <path d="M16 16v-6" />
    </>
  ),
  file: (
    <>
      <path d="M7 3.5h7l5 5V20a1.5 1.5 0 0 1-1.5 1.5h-10.5A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5Z" />
      <path d="M14 3.5V9h5.5" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.2M12 18.3v2.2M4.8 6.8l1.6 1.6M17.6 15.6l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.8 17.2l1.6-1.6M17.6 8.4l1.6-1.6" />
    </>
  ),
  list: (
    <>
      <path d="M9 7h11" />
      <path d="M9 12h11" />
      <path d="M9 17h11" />
      <path d="M4 7h.01" />
      <path d="M4 12h.01" />
      <path d="M4 17h.01" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </>
  ),
};

export function Icon({ name, className = 'h-4 w-4' }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {paths[name]}
    </svg>
  );
}
