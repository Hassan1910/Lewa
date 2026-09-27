import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import type { IconName } from './icons';
import { Icon } from './icons';
import { Button, humanize, PageHeader } from './ui';

type NavItem = {
  to: string;
  label: string;
  description: string;
  min: 'staff' | 'admin';
  group: 'Overview' | 'Operations' | 'Programs' | 'Finance' | 'System';
  icon: IconName;
};

const GROUPS: NavItem['group'][] = ['Overview', 'Operations', 'Programs', 'Finance', 'System'];

export const NAV: NavItem[] = [
  { to: '/', label: 'Dashboard', description: 'A live snapshot of people, bookings, and conservation activity.', min: 'staff', group: 'Overview', icon: 'grid' },
  { to: '/bookings', label: 'Bookings', description: 'Guest reservations and payment status.', min: 'staff', group: 'Operations', icon: 'calendar' },
  { to: '/tourism', label: 'Tourism', description: 'Safari services and accommodation.', min: 'staff', group: 'Operations', icon: 'compass' },
  { to: '/events', label: 'Events', description: 'Programs visitors can join.', min: 'staff', group: 'Operations', icon: 'flag' },
  { to: '/feedback', label: 'Feedback', description: 'Messages from visitors and donors.', min: 'staff', group: 'Operations', icon: 'message' },
  { to: '/notifications', label: 'Notifications', description: 'Broadcasts sent to the app.', min: 'staff', group: 'Operations', icon: 'bell' },
  { to: '/wildlife', label: 'Wildlife', description: 'Species profiles shown in the app.', min: 'staff', group: 'Programs', icon: 'leaf' },
  { to: '/conservation', label: 'Conservation', description: 'Conservation programs published to the app.', min: 'staff', group: 'Programs', icon: 'tree' },
  { to: '/education', label: 'Education', description: 'Learning resources for visitors and schools.', min: 'staff', group: 'Programs', icon: 'book' },
  { to: '/community', label: 'Community', description: 'Community programs and where they happen.', min: 'staff', group: 'Programs', icon: 'people' },
  { to: '/donations', label: 'Donations', description: 'Campaigns and individual gifts.', min: 'staff', group: 'Programs', icon: 'heart' },
  { to: '/content', label: 'Content', description: 'FAQs, announcements, and about copy.', min: 'staff', group: 'Programs', icon: 'file' },
  { to: '/payments', label: 'Payments', description: 'Charges recorded after Paystack verification.', min: 'admin', group: 'Finance', icon: 'card' },
  { to: '/reports', label: 'Reports', description: 'Payment totals in Kenyan Shillings.', min: 'admin', group: 'Finance', icon: 'chart' },
  { to: '/users', label: 'Users', description: 'Accounts, roles, and access.', min: 'admin', group: 'System', icon: 'users' },
  { to: '/settings', label: 'Settings', description: 'Site configuration stored as JSON.', min: 'admin', group: 'System', icon: 'gear' },
  { to: '/audit', label: 'Audit logs', description: 'Recent changes recorded by the system.', min: 'staff', group: 'System', icon: 'list' },
];

function initials(name?: string | null) {
  const parts = (name ?? 'Lewa').trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || 'L';
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { profile, isAdmin, signOut } = useAuth();
  const { pathname } = useLocation();
  const items = NAV.filter((item) => item.min === 'staff' || isAdmin);

  return (
    <div className="flex h-full flex-col bg-[#0f2419] text-white">
      <div className="px-5 pb-4 pt-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-200">
            <Icon name="leaf" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-200/80">Lewa</p>
            <p className="text-base font-semibold leading-tight">Conservancy</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        {GROUPS.map((group) => {
          const groupItems = items.filter((item) => item.group === group);
          if (groupItems.length === 0) return null;
          return (
            <div key={group}>
              <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-200/45">{group}</p>
              <div className="space-y-0.5">
                {groupItems.map((item) => {
                  const active = pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      aria-current={active ? 'page' : undefined}
                      onClick={onNavigate}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
                        active ? 'bg-white/15 text-white shadow-sm ring-1 ring-white/15' : 'text-emerald-50/75 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon name={item.icon} className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="truncate text-sm font-semibold">{profile?.full_name ?? 'Staff'}</p>
        <p className="mt-0.5 text-xs capitalize text-emerald-100/70">{humanize(profile?.role ?? 'staff')}</p>
        <Button
          type="button"
          tone="ghost"
          className="mt-3 w-full border-white/15 bg-transparent text-white hover:bg-white/10"
          onClick={() => void signOut()}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const meta = NAV.find((item) => item.to === pathname) ?? NAV[0];

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="min-h-screen bg-[#f6f4ef] text-stone-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <Sidebar />
      </aside>
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-stone-950/50" aria-label="Close menu" onClick={() => setOpen(false)} />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col shadow-2xl">
            <button
              type="button"
              className="absolute right-3 top-4 z-10 grid h-8 w-8 place-items-center rounded-lg text-emerald-50/80 hover:bg-white/10"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <Icon name="close" />
            </button>
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-stone-200/80 bg-[#f6f4ef]/90 px-4 py-3 backdrop-blur md:px-8">
          <button
            type="button"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-stone-200 bg-white text-stone-700 shadow-sm lg:hidden"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Icon name="menu" />
          </button>
          <PageHeader
            title={meta.label}
            description={meta.description}
            aside={
              <div className="flex shrink-0 items-center gap-2 rounded-full border border-stone-200 bg-white py-1 pl-1 pr-3 shadow-sm">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-800 text-xs font-bold text-white">
                  {initials(profile?.full_name)}
                </span>
                <span className="hidden max-w-32 truncate text-sm font-semibold text-stone-800 sm:block">
                  {profile?.full_name ?? 'Staff'}
                </span>
              </div>
            }
          />
        </header>
        <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
