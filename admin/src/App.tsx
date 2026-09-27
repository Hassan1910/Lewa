import { FormEvent, useEffect, useState, type ReactNode } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Shell } from './components/shell';
import type { IconName } from './components/icons';
import {
  Badge,
  Button,
  Card,
  CheckField,
  DataTable,
  EmptyRow,
  Field,
  FormCard,
  humanize,
  SectionHeading,
  SelectField,
  StatCard,
  StatusSelect,
  TextArea,
} from './components/ui';
import { useAuth, type Role } from './lib/auth';
import { formatCurrency, formatDate } from './lib/format';
import { supabase } from './lib/supabase';

const METRICS: { key: string; label: string; icon: IconName }[] = [
  { key: 'profiles', label: 'Users', icon: 'users' },
  { key: 'bookings', label: 'Bookings', icon: 'calendar' },
  { key: 'payments', label: 'Payments', icon: 'card' },
  { key: 'donations', label: 'Donations', icon: 'heart' },
  { key: 'wildlife_species', label: 'Wildlife', icon: 'leaf' },
  { key: 'events', label: 'Events', icon: 'flag' },
  { key: 'feedback', label: 'Feedback', icon: 'message' },
];

const BOOKING_STATUSES = ['pending_payment', 'payment_verification', 'confirmed', 'cancelled', 'completed', 'refunded'];
const FEEDBACK_STATUSES = ['open', 'in_progress', 'resolved', 'closed'];
const USER_ROLES: Role[] = ['visitor', 'donor', 'researcher', 'community_member', 'staff', 'administrator', 'super_admin'];

export function App() {
  const { loading, session, profile, isStaff } = useAuth();
  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-[#f6f4ef] text-sm font-medium text-stone-500">Loading…</div>;
  }
  if (!session) return <Login />;
  if (!isStaff) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f6f4ef] px-4">
        <div className="w-full max-w-lg rounded-3xl border border-stone-200/80 bg-white p-8 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">Lewa</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Staff access only</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            This dashboard is limited to staff, administrators and super administrators. Your current role is{' '}
            {profile?.role ?? 'visitor'}.
          </p>
          <SignOutButton className="mt-6" />
        </div>
      </div>
    );
  }
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<AdminOnly><UsersPage /></AdminOnly>} />
        <Route path="/wildlife" element={<WildlifePage />} />
        <Route path="/tourism" element={<TourismPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/conservation" element={<SimpleContent table="conservation_programs" title="Conservation" />} />
        <Route path="/education" element={<SimpleContent table="education_resources" title="Education" extra={['category', 'reading_minutes']} />} />
        <Route path="/community" element={<SimpleContent table="community_programs" title="Community" extra={['location']} />} />
        <Route path="/donations" element={<DonationsPage />} />
        <Route path="/payments" element={<AdminOnly><PaymentsPage /></AdminOnly>} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/reports" element={<AdminOnly><ReportsPage /></AdminOnly>} />
        <Route path="/content" element={<ContentPage />} />
        <Route path="/settings" element={<AdminOnly><SettingsPage /></AdminOnly>} />
        <Route path="/audit" element={<AuditPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}

function AdminOnly({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return (
      <Card bodyClassName="p-6">
        <p className="text-sm text-stone-600">Administrator access required.</p>
      </Card>
    );
  }
  return <>{children}</>;
}

function SignOutButton({ className = '' }: { className?: string }) {
  const { signOut } = useAuth();
  return (
    <Button type="button" tone="ghost" className={className} onClick={() => void signOut()}>
      Sign out
    </Button>
  );
}

function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    }
  };
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-[#0f2419] p-12 text-white lg:flex">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-200">Lewa Conservancy</p>
          <h1 className="mt-8 max-w-md text-4xl font-semibold leading-tight tracking-tight">The staff desk for wildlife, guests, and giving.</h1>
        </div>
        <ul className="space-y-3 text-sm text-emerald-50/80">
          <li>Bookings and payments in Kenyan Shillings</li>
          <li>Wildlife, events, and community programs</li>
          <li>Staff roles with an audit trail</li>
        </ul>
      </div>
      <div className="flex items-center justify-center bg-[#f6f4ef] px-4 py-12">
        <form onSubmit={(e) => void onSubmit(e)} className="w-full max-w-md space-y-4 rounded-3xl border border-stone-200/80 bg-white p-8 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800 lg:hidden">Lewa Conservancy</p>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Staff sign in</h1>
            <p className="mt-1 text-sm text-stone-500">Use a staff, administrator, or super administrator account.</p>
          </div>
          <Field label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Field label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          <Button type="submit" className="w-full">Sign in</Button>
        </form>
      </div>
    </div>
  );
}

function Dashboard() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [ready, setReady] = useState(false);
  const [bookings, setBookings] = useState<Array<Record<string, unknown>>>([]);
  const [feedback, setFeedback] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [countRows, bookingResult, feedbackResult] = await Promise.all([
          Promise.all(
            METRICS.map(async (metric) => {
              const { count } = await supabase.from(metric.key).select('*', { count: 'exact', head: true });
              return [metric.key, count ?? 0] as const;
            }),
          ),
          supabase.from('bookings').select('id, reference, service_title, amount, currency, status, created_at').order('created_at', { ascending: false }).limit(5),
          supabase.from('feedback').select('id, subject, category, status, created_at').order('created_at', { ascending: false }).limit(5),
        ]);
        setCounts(Object.fromEntries(countRows));
        setBookings(bookingResult.data ?? []);
        setFeedback(feedbackResult.data ?? []);
      } finally {
        setReady(true);
      }
    };
    void load();
  }, []);

  const chart = METRICS.map((metric) => ({ name: metric.label, value: counts[metric.key] ?? 0 }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {METRICS.map((metric) => (
          <StatCard key={metric.key} label={metric.label} icon={metric.icon} value={ready ? counts[metric.key] ?? 0 : '—'} />
        ))}
      </div>
      <Card title="Records by area" description="Live counts from the shared Supabase project.">
        <div className="h-80 px-2 py-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart} barSize={28} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid stroke="#f0eeea" vertical={false} />
              <XAxis dataKey="name" interval={0} angle={-28} textAnchor="end" height={68} tick={{ fontSize: 11, fill: '#78716c' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#78716c' }} axisLine={false} tickLine={false} width={36} />
              <Tooltip cursor={{ fill: '#f5f5f4' }} contentStyle={{ borderRadius: 12, borderColor: '#e7e5e4', fontSize: 13 }} />
              <Bar dataKey="value" fill="#065f46" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card
          title="Recent bookings"
          action={<Link to="/bookings" className="text-xs font-semibold text-emerald-800">View all</Link>}
          bodyClassName="overflow-x-auto"
        >
          <table className="data-table">
            <thead><tr><th>Ref</th><th>Service</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {bookings.length === 0 ? <EmptyRow colSpan={4} label={ready ? 'No bookings yet.' : 'Loading bookings…'} /> : bookings.map((row) => (
                <tr key={String(row.id)}>
                  <td className="font-medium">{String(row.reference ?? '')}</td>
                  <td>{String(row.service_title ?? '')}</td>
                  <td>{formatCurrency(Number(row.amount), String(row.currency ?? 'KES'))}</td>
                  <td><Badge value={String(row.status ?? '')} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card
          title="Recent feedback"
          action={<Link to="/feedback" className="text-xs font-semibold text-emerald-800">View all</Link>}
          bodyClassName="overflow-x-auto"
        >
          <table className="data-table">
            <thead><tr><th>Subject</th><th>Category</th><th>Status</th></tr></thead>
            <tbody>
              {feedback.length === 0 ? <EmptyRow colSpan={3} label={ready ? 'No feedback yet.' : 'Loading feedback…'} /> : feedback.map((row) => (
                <tr key={String(row.id)}>
                  <td className="font-medium">{String(row.subject ?? '')}</td>
                  <td className="capitalize">{humanize(String(row.category ?? ''))}</td>
                  <td><Badge value={String(row.status ?? '')} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

function UsersPage() {
  const { isSuper } = useAuth();
  const [rows, setRows] = useState<Array<{ id: string; full_name: string; email: string; role: Role; status: string }>>([]);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'staff' });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const reload = async () => {
    const { data } = await supabase.from('profiles').select('id, full_name, email, role, status').order('created_at', { ascending: false });
    setRows((data as never) ?? []);
  };
  useEffect(() => { void reload(); }, []);
  return (
    <section>
      {isSuper ? (
        <FormCard
          title="Create staff login"
          onSubmit={async (e) => {
            e.preventDefault();
            setFormError(null);
            setSaving(true);
            const { data, error } = await supabase.functions.invoke('admin-create-staff', { body: form });
            setSaving(false);
            if (error) {
              let message = error.message;
              const context = (error as { context?: { json?: () => Promise<{ error?: string }> } }).context;
              if (context?.json) {
                try {
                  const body = await context.json();
                  if (body?.error) message = body.error;
                } catch {
                  /* keep the client message */
                }
              }
              setFormError(message);
              return;
            }
            if (data?.error) {
              setFormError(String(data.error));
              return;
            }
            setForm({ fullName: '', email: '', password: '', role: 'staff' });
            void reload();
          }}
        >
          <Field label="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          <Field label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Field label="Temporary password" type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <SelectField label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="staff">staff</option>
            <option value="administrator">administrator</option>
          </SelectField>
          {formError ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">{formError}</p> : null}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create account'}</Button>
          </div>
        </FormCard>
      ) : null}
      <DataTable>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
        <tbody>
          {rows.length === 0 ? <EmptyRow colSpan={4} label="No users yet." /> : rows.map((r) => (
            <tr key={r.id}>
              <td className="font-medium">{r.full_name}</td>
              <td>{r.email}</td>
              <td>
                <SelectField
                  compact
                  disabled={!isSuper}
                  value={r.role}
                  onChange={async (e) => {
                    await supabase.from('profiles').update({ role: e.target.value }).eq('id', r.id);
                    void reload();
                  }}
                >
                  {USER_ROLES.map((role) => (
                    <option key={role} value={role}>{humanize(role)}</option>
                  ))}
                </SelectField>
              </td>
              <td>
                <StatusSelect
                  value={r.status}
                  options={['active', 'suspended', 'archived']}
                  onChange={async (status) => {
                    await supabase.from('profiles').update({ status }).eq('id', r.id);
                    void reload();
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </section>
  );
}

function WildlifePage() {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [form, setForm] = useState({ id: '', name: '', scientific_name: '', category: 'Mammals', conservation_status: 'Endangered', description: '', image_url: '', featured: false });
  const reload = async () => {
    const { data } = await supabase.from('wildlife_species').select('*').order('name');
    setRows(data ?? []);
  };
  useEffect(() => { void reload(); }, []);
  return (
    <section>
      <FormCard
        onSubmit={async (e) => {
          e.preventDefault();
          await supabase.from('wildlife_species').upsert({
            ...form,
            id: form.id || form.name.toLowerCase().replace(/\s+/g, '-'),
            status: 'published',
          });
          setForm({ id: '', name: '', scientific_name: '', category: 'Mammals', conservation_status: 'Endangered', description: '', image_url: '', featured: false });
          void reload();
        }}
      >
        <Field label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Field label="Scientific name" value={form.scientific_name} onChange={(e) => setForm({ ...form, scientific_name: e.target.value })} />
        <Field label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <Field label="Conservation status" value={form.conservation_status} onChange={(e) => setForm({ ...form, conservation_status: e.target.value })} />
        <Field className="sm:col-span-2" label="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        <TextArea className="sm:col-span-2" label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <CheckField label="Featured" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
        <div className="flex items-end">
          <Button type="submit">Save species</Button>
        </div>
      </FormCard>
      <DataTable>
        <thead><tr><th>Name</th><th>Category</th><th>Status</th><th>Featured</th><th /></tr></thead>
        <tbody>
          {rows.length === 0 ? <EmptyRow colSpan={5} label="No species yet." /> : rows.map((r) => (
            <tr key={String(r.id)}>
              <td className="font-medium">{String(r.name)}</td>
              <td>{String(r.category)}</td>
              <td><Badge value={String(r.conservation_status ?? '')} /></td>
              <td><Badge value={r.featured ? 'yes' : 'no'} /></td>
              <td>
                <Button type="button" tone="danger" className="px-3 py-1.5" onClick={async () => { await supabase.from('wildlife_species').delete().eq('id', r.id); void reload(); }}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </section>
  );
}

function TourismPage() {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [form, setForm] = useState({ id: '', title: '', category: 'Safari', price: '18000', duration_label: '3 hrs', capacity: '6', summary: '', pricing_unit: 'per_guest' });
  const reload = async () => {
    const { data } = await supabase.from('tourism_services').select('*').order('title');
    setRows(data ?? []);
  };
  useEffect(() => { void reload(); }, []);
  return (
    <section>
      <FormCard
        onSubmit={async (e) => {
          e.preventDefault();
          await supabase.from('tourism_services').upsert({
            id: form.id || form.title.toLowerCase().replace(/\s+/g, '-'),
            title: form.title,
            category: form.category,
            service_type: form.category,
            price: Number(form.price),
            currency: 'KES',
            duration_label: form.duration_label,
            capacity: Number(form.capacity),
            summary: form.summary,
            pricing_unit: form.pricing_unit,
            status: 'published',
          });
          void reload();
        }}
      >
        <Field label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <Field label="Category / service type" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <Field label="Price (KSh)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <Field label="Duration" value={form.duration_label} onChange={(e) => setForm({ ...form, duration_label: e.target.value })} />
        <Field label="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
        <SelectField label="Pricing" value={form.pricing_unit} onChange={(e) => setForm({ ...form, pricing_unit: e.target.value })}>
          <option value="per_guest">per guest</option>
          <option value="per_booking">per booking (accommodation)</option>
        </SelectField>
        <TextArea className="sm:col-span-2" label="Summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        <div className="sm:col-span-2">
          <Button type="submit">Save service</Button>
        </div>
      </FormCard>
      <DataTable>
        <thead><tr><th>Title</th><th>Type</th><th>Price</th><th>Capacity</th><th /></tr></thead>
        <tbody>
          {rows.length === 0 ? <EmptyRow colSpan={5} label="No services yet." /> : rows.map((r) => (
            <tr key={String(r.id)}>
              <td className="font-medium">{String(r.title)}</td>
              <td>{String(r.category)}</td>
              <td>{formatCurrency(Number(r.price), String(r.currency ?? 'KES'))}</td>
              <td>{String(r.capacity)}</td>
              <td><Button type="button" tone="danger" className="px-3 py-1.5" onClick={async () => { await supabase.from('tourism_services').delete().eq('id', r.id); void reload(); }}>Delete</Button></td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </section>
  );
}

function BookingsPage() {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const reload = async () => {
    const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    setRows(data ?? []);
  };
  useEffect(() => { void reload(); }, []);
  return (
    <DataTable>
      <thead><tr><th>Ref</th><th>Service</th><th>Date</th><th>Guests</th><th>Amount</th><th>Status</th></tr></thead>
      <tbody>
        {rows.length === 0 ? <EmptyRow colSpan={6} label="No bookings yet." /> : rows.map((r) => (
          <tr key={String(r.id)}>
            <td className="font-medium">{String(r.reference)}</td>
            <td>{String(r.service_title)}</td>
            <td>{formatDate(String(r.booking_date))}</td>
            <td>{String(r.guests)}</td>
            <td>{formatCurrency(Number(r.amount), String(r.currency))}</td>
            <td>
              <StatusSelect
                value={String(r.status)}
                options={BOOKING_STATUSES}
                onChange={async (status) => { await supabase.from('bookings').update({ status }).eq('id', r.id); void reload(); }}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </DataTable>
  );
}

function EventsPage() {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [form, setForm] = useState({ title: '', location: '', start_at: '', registration_required: true });
  const reload = async () => {
    const { data } = await supabase.from('events').select('*').order('start_at');
    setRows(data ?? []);
  };
  useEffect(() => { void reload(); }, []);
  return (
    <section>
      <FormCard onSubmit={async (e) => {
        e.preventDefault();
        await supabase.from('events').insert({
          id: form.title.toLowerCase().replace(/\s+/g, '-'),
          title: form.title,
          location: form.location,
          start_at: form.start_at,
          registration_required: form.registration_required,
          status: 'published',
        });
        void reload();
      }}>
        <Field label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <Field label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <Field label="Starts" type="datetime-local" value={form.start_at} onChange={(e) => setForm({ ...form, start_at: e.target.value })} required />
        <CheckField label="Registration required" checked={form.registration_required} onChange={(e) => setForm({ ...form, registration_required: e.target.checked })} />
        <div className="sm:col-span-2">
          <Button type="submit">Create event</Button>
        </div>
      </FormCard>
      <DataTable>
        <thead><tr><th>Title</th><th>When</th><th>Location</th><th /></tr></thead>
        <tbody>
          {rows.length === 0 ? <EmptyRow colSpan={4} label="No events yet." /> : rows.map((r) => (
            <tr key={String(r.id)}>
              <td className="font-medium">{String(r.title)}</td>
              <td>{formatDate(String(r.start_at))}</td>
              <td>{String(r.location ?? '')}</td>
              <td><Button type="button" tone="danger" className="px-3 py-1.5" onClick={async () => { await supabase.from('events').delete().eq('id', r.id); void reload(); }}>Delete</Button></td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </section>
  );
}

function SimpleContent({ table, title, extra = [] }: { table: string; title: string; extra?: string[] }) {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [form, setForm] = useState({ title: '', summary: '' });
  const reload = async () => {
    const { data } = await supabase.from(table).select('*').order('title');
    setRows(data ?? []);
  };
  useEffect(() => { void reload(); }, [table]);
  return (
    <section>
      <FormCard
        columns={1}
        title={`Add ${title.toLowerCase()}`}
        onSubmit={async (e) => {
          e.preventDefault();
          await supabase.from(table).insert({ id: form.title.toLowerCase().replace(/\s+/g, '-'), title: form.title, summary: form.summary, status: 'published' });
          setForm({ title: '', summary: '' });
          void reload();
        }}
      >
        <Field label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <TextArea label="Summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        <div>
          <Button type="submit">Add</Button>
        </div>
      </FormCard>
      <DataTable>
        <thead><tr><th>Title</th><th>Summary</th>{extra.map((c) => <th key={c} className="capitalize">{humanize(c)}</th>)}<th /></tr></thead>
        <tbody>
          {rows.length === 0 ? <EmptyRow colSpan={3 + extra.length} label={`No ${title.toLowerCase()} yet.`} /> : rows.map((r) => (
            <tr key={String(r.id)}>
              <td className="font-medium">{String(r.title)}</td>
              <td>{String(r.summary ?? '')}</td>
              {extra.map((c) => <td key={c}>{String(r[c] ?? '')}</td>)}
              <td><Button type="button" tone="danger" className="px-3 py-1.5" onClick={async () => { await supabase.from(table).delete().eq('id', r.id); void reload(); }}>Delete</Button></td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </section>
  );
}

function DonationsPage() {
  const [campaigns, setCampaigns] = useState<Array<Record<string, unknown>>>([]);
  const [gifts, setGifts] = useState<Array<Record<string, unknown>>>([]);
  useEffect(() => {
    void supabase.from('donation_campaigns').select('*').then(({ data }) => setCampaigns(data ?? []));
    void supabase.from('donations').select('*').order('created_at', { ascending: false }).then(({ data }) => setGifts(data ?? []));
  }, []);
  return (
    <section className="space-y-8">
      <div>
        <SectionHeading title="Campaigns" />
        <DataTable>
          <thead><tr><th>Title</th><th>Raised</th><th>Goal</th><th>Active</th></tr></thead>
          <tbody>
            {campaigns.length === 0 ? <EmptyRow colSpan={4} label="No campaigns yet." /> : campaigns.map((c) => (
              <tr key={String(c.id)}>
                <td className="font-medium">{String(c.title)}</td>
                <td>{formatCurrency(Number(c.amount_raised), String(c.currency))}</td>
                <td>{formatCurrency(Number(c.goal_amount), String(c.currency))}</td>
                <td><Badge value={c.active ? 'yes' : 'no'} /></td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </div>
      <div>
        <SectionHeading title="Individual gifts" />
        <DataTable>
          <thead><tr><th>Amount</th><th>Status</th><th>Donor</th><th>When</th></tr></thead>
          <tbody>
            {gifts.length === 0 ? <EmptyRow colSpan={4} label="No gifts yet." /> : gifts.map((g) => (
              <tr key={String(g.id)}>
                <td className="font-medium">{formatCurrency(Number(g.amount), String(g.currency))}</td>
                <td><Badge value={String(g.status)} /></td>
                <td>{String(g.donor_name ?? g.donor_email ?? '—')}</td>
                <td>{formatDate(String(g.created_at))}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </div>
    </section>
  );
}

function PaymentsPage() {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  useEffect(() => {
    void supabase.from('payments').select('*').order('created_at', { ascending: false }).then(({ data }) => setRows(data ?? []));
  }, []);
  return (
    <DataTable>
      <thead><tr><th>Reference</th><th>Amount</th><th>Status</th><th>Purpose</th><th>When</th></tr></thead>
      <tbody>
        {rows.length === 0 ? <EmptyRow colSpan={5} label="No payments yet." /> : rows.map((r) => (
          <tr key={String(r.id)}>
            <td className="font-medium">{String(r.reference)}</td>
            <td>{formatCurrency(Number(r.amount), String(r.currency))}</td>
            <td><Badge value={String(r.status)} /></td>
            <td className="capitalize">{humanize(String(r.purpose ?? ''))}</td>
            <td>{formatDate(String(r.created_at))}</td>
          </tr>
        ))}
      </tbody>
    </DataTable>
  );
}

function NotificationsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const reload = async () => {
    const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50);
    setRows(data ?? []);
  };
  useEffect(() => { void reload(); }, []);
  return (
    <section>
      <FormCard
        columns={1}
        title="Broadcast"
        onSubmit={async (e) => {
          e.preventDefault();
          const { error } = await supabase.functions.invoke('admin-notify', { body: { title, message } });
          if (error) alert(error.message);
          setTitle('');
          setMessage('');
          void reload();
        }}
      >
        <Field label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <TextArea label="Message" value={message} onChange={(e) => setMessage(e.target.value)} required />
        <div>
          <Button type="submit">Broadcast</Button>
        </div>
      </FormCard>
      <DataTable>
        <thead><tr><th>Title</th><th>Audience</th><th>When</th></tr></thead>
        <tbody>
          {rows.length === 0 ? <EmptyRow colSpan={3} label="No notifications yet." /> : rows.map((r) => (
            <tr key={String(r.id)}>
              <td className="font-medium">{String(r.title)}</td>
              <td>{r.broadcast ? 'Everyone' : 'User'}</td>
              <td>{formatDate(String(r.created_at))}</td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </section>
  );
}

function FeedbackPage() {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const reload = async () => {
    const { data } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    setRows(data ?? []);
  };
  useEffect(() => { void reload(); }, []);
  return (
    <DataTable>
      <thead><tr><th>Subject</th><th>Category</th><th>Message</th><th>Status</th><th>Response</th></tr></thead>
      <tbody>
        {rows.length === 0 ? <EmptyRow colSpan={5} label="No feedback yet." /> : rows.map((r) => (
          <tr key={String(r.id)}>
            <td className="font-medium">{String(r.subject)}</td>
            <td className="capitalize">{humanize(String(r.category))}</td>
            <td className="max-w-xs whitespace-normal text-stone-600">{String(r.message)}</td>
            <td>
              <StatusSelect
                value={String(r.status)}
                options={FEEDBACK_STATUSES}
                onChange={async (status) => { await supabase.from('feedback').update({ status }).eq('id', r.id); void reload(); }}
              />
            </td>
            <td>
              <Button
                type="button"
                tone="ghost"
                className="px-3 py-1.5 text-emerald-800"
                onClick={async () => {
                  const admin_response = prompt('Response', String(r.admin_response ?? ''));
                  if (admin_response != null) {
                    await supabase.from('feedback').update({ admin_response, responded_at: new Date().toISOString() }).eq('id', r.id);
                    void reload();
                  }
                }}
              >
                Reply
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </DataTable>
  );
}

function ReportsPage() {
  const [payments, setPayments] = useState<Array<Record<string, unknown>>>([]);
  useEffect(() => {
    void supabase.from('payments').select('amount, status, created_at, currency').then(({ data }) => setPayments(data ?? []));
  }, []);
  const success = payments.filter((p) => p.status === 'success');
  const total = success.reduce((sum, p) => sum + Number(p.amount), 0);
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard label="Verified payments" value={formatCurrency(total)} icon="card" />
      <StatCard label="Successful charges" value={success.length} icon="chart" />
      <StatCard label="All payment rows" value={payments.length} icon="list" />
    </div>
  );
}

function ContentPage() {
  const [faqs, setFaqs] = useState<Array<Record<string, unknown>>>([]);
  const [ann, setAnn] = useState<Array<Record<string, unknown>>>([]);
  const [about, setAbout] = useState<Array<Record<string, unknown>>>([]);
  const reload = async () => {
    const [f, a, ab] = await Promise.all([
      supabase.from('faqs').select('*').order('sort_order'),
      supabase.from('announcements').select('*').order('publish_at', { ascending: false }),
      supabase.from('about_content').select('*').order('sort_order'),
    ]);
    setFaqs(f.data ?? []);
    setAnn(a.data ?? []);
    setAbout(ab.data ?? []);
  };
  useEffect(() => { void reload(); }, []);
  return (
    <section className="space-y-8">
      <div>
        <SectionHeading title="FAQs" />
        <DataTable>
          <thead><tr><th>Question</th><th>Answer</th></tr></thead>
          <tbody>
            {faqs.length === 0 ? <EmptyRow colSpan={2} label="No FAQs yet." /> : faqs.map((f) => (
              <tr key={String(f.id)}><td className="font-medium">{String(f.question)}</td><td className="whitespace-normal text-stone-600">{String(f.answer)}</td></tr>
            ))}
          </tbody>
        </DataTable>
      </div>
      <div>
        <SectionHeading title="Announcements" />
        <DataTable>
          <thead><tr><th>Title</th><th>Tone</th></tr></thead>
          <tbody>
            {ann.length === 0 ? <EmptyRow colSpan={2} label="No announcements yet." /> : ann.map((a) => (
              <tr key={String(a.id)}><td className="font-medium">{String(a.title)}</td><td><Badge value={String(a.tone)} /></td></tr>
            ))}
          </tbody>
        </DataTable>
      </div>
      <div>
        <SectionHeading title="About" />
        <div className="space-y-3">
          {about.length === 0 ? (
            <Card bodyClassName="px-5 py-10 text-center text-sm text-stone-500">No about sections yet.</Card>
          ) : about.map((s) => (
            <Card key={String(s.key)} title={String(s.title)} bodyClassName="p-5">
              <TextArea defaultValue={String(s.body)} onBlur={async (e) => { await supabase.from('about_content').update({ body: e.target.value }).eq('key', s.key); }} />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function SettingsPage() {
  const [value, setValue] = useState('{"name":"Lewa Wildlife Conservancy","currency":"KES"}');
  useEffect(() => {
    void supabase.from('site_settings').select('value').eq('key', 'general').maybeSingle().then(({ data }) => {
      if (data?.value) setValue(JSON.stringify(data.value, null, 2));
    });
  }, []);
  return (
    <Card title="General" description="Saved to site settings under the general key." bodyClassName="p-5">
      <TextArea areaClassName="min-h-64 font-mono text-xs font-medium" value={value} onChange={(e) => setValue(e.target.value)} />
      <Button
        type="button"
        className="mt-3"
        onClick={async () => {
          await supabase.from('site_settings').upsert({ key: 'general', value: JSON.parse(value) });
          alert('Saved');
        }}
      >
        Save
      </Button>
    </Card>
  );
}

function AuditPage() {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  useEffect(() => {
    void supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100).then(({ data }) => setRows(data ?? []));
  }, []);
  return (
    <DataTable>
      <thead><tr><th>When</th><th>Action</th><th>Entity</th><th>Actor</th></tr></thead>
      <tbody>
        {rows.length === 0 ? <EmptyRow colSpan={4} label="No audit events yet." /> : rows.map((r) => (
          <tr key={String(r.id)}>
            <td>{formatDate(String(r.created_at))}</td>
            <td><Badge value={String(r.action)} /></td>
            <td>{String(r.entity_type)} {String(r.entity_id ?? '')}</td>
            <td className="font-mono text-xs">{String(r.actor_user_id ?? 'system')}</td>
          </tr>
        ))}
      </tbody>
    </DataTable>
  );
}
