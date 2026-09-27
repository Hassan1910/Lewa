import { FormEvent, useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth, type Role } from './lib/auth';
import { formatCurrency, formatDate } from './lib/format';
import { supabase } from './lib/supabase';

const NAV: { to: string; label: string; min: 'staff' | 'admin' }[] = [
  { to: '/', label: 'Dashboard', min: 'staff' },
  { to: '/users', label: 'Users', min: 'admin' },
  { to: '/wildlife', label: 'Wildlife', min: 'staff' },
  { to: '/tourism', label: 'Tourism / Accommodation', min: 'staff' },
  { to: '/bookings', label: 'Bookings', min: 'staff' },
  { to: '/events', label: 'Events', min: 'staff' },
  { to: '/conservation', label: 'Conservation', min: 'staff' },
  { to: '/education', label: 'Education', min: 'staff' },
  { to: '/community', label: 'Community', min: 'staff' },
  { to: '/donations', label: 'Donations', min: 'staff' },
  { to: '/payments', label: 'Payments', min: 'admin' },
  { to: '/notifications', label: 'Notifications', min: 'staff' },
  { to: '/feedback', label: 'Feedback', min: 'staff' },
  { to: '/reports', label: 'Reports', min: 'admin' },
  { to: '/content', label: 'Content', min: 'staff' },
  { to: '/settings', label: 'Settings', min: 'admin' },
  { to: '/audit', label: 'Audit logs', min: 'staff' },
];

export function App() {
  const { loading, session, profile, isStaff } = useAuth();
  if (loading) return <div className="p-10 text-stone-500">Loading…</div>;
  if (!session) return <Login />;
  if (!isStaff) {
    return (
      <div className="mx-auto max-w-lg p-10">
        <h1 className="text-2xl font-semibold">Staff access only</h1>
        <p className="mt-2 text-stone-600">
          This dashboard is limited to staff, administrators and super administrators. Your current role is{' '}
          {profile?.role ?? 'visitor'}.
        </p>
        <SignOutButton />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-stone-50">
      <aside className="fixed inset-y-0 left-0 w-64 overflow-y-auto border-r border-stone-200 bg-white p-4">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-800">Lewa</p>
          <h1 className="text-lg font-semibold">Staff dashboard</h1>
          <p className="text-xs text-stone-500">{profile?.full_name} · {profile?.role}</p>
        </div>
        <nav className="space-y-1">
          {NAV.filter((item) => item.min === 'staff' || profile?.role === 'administrator' || profile?.role === 'super_admin').map((item) => (
            <NavLink key={item.to} to={item.to} label={item.label} />
          ))}
        </nav>
        <div className="mt-8">
          <SignOutButton />
        </div>
      </aside>
      <main className="ml-64 p-8">
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
      </main>
    </div>
  );
}

function NavLink({ to, label }: { to: string; label: string }) {
  const loc = useLocation();
  const active = loc.pathname === to;
  return (
    <Link
      to={to}
      className={`block rounded-lg px-3 py-2 text-sm ${active ? 'bg-emerald-800 text-white' : 'text-stone-700 hover:bg-stone-100'}`}
    >
      {label}
    </Link>
  );
}

function AdminOnly({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <p className="text-stone-600">Administrator access required.</p>;
  return <>{children}</>;
}

function SignOutButton() {
  const { signOut } = useAuth();
  return (
    <button className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm" onClick={() => void signOut()}>
      Sign out
    </button>
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
    <form onSubmit={(e) => void onSubmit(e)} className="mx-auto mt-24 max-w-md space-y-4 rounded-2xl border border-stone-200 bg-white p-8">
      <p className="text-xs uppercase tracking-[0.2em] text-emerald-800">Lewa Conservancy</p>
      <h1 className="text-2xl font-semibold">Staff sign in</h1>
      <input className="w-full rounded-lg border px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full rounded-lg border px-3 py-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button className="w-full rounded-lg bg-emerald-800 py-2 text-white">Sign in</button>
    </form>
  );
}

function Dashboard() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    const load = async () => {
      const tables = ['profiles', 'bookings', 'payments', 'donations', 'wildlife_species', 'events', 'feedback'];
      const next: Record<string, number> = {};
      await Promise.all(
        tables.map(async (table) => {
          const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
          next[table] = count ?? 0;
        }),
      );
      setCounts(next);
    };
    void load();
  }, []);
  const chart = Object.entries(counts).map(([name, value]) => ({ name, value }));
  return (
    <div>
      <h2 className="text-2xl font-semibold">Overview</h2>
      <p className="text-stone-600">Live counts from the shared Supabase project. Amounts are in Kenyan Shillings.</p>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Object.entries(counts).map(([k, v]) => (
          <div key={k} className="rounded-xl border border-stone-200 bg-white p-4">
            <p className="text-xs uppercase text-stone-500">{k.replace('_', ' ')}</p>
            <p className="text-2xl font-semibold">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 h-72 rounded-xl border border-stone-200 bg-white p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chart}>
            <XAxis dataKey="name" hide />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#065f46" />
          </BarChart>
        </ResponsiveContainer>
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
      <h2 className="mb-4 text-2xl font-semibold">Users</h2>
      {isSuper ? (
        <form
          className="mb-6 grid grid-cols-2 gap-3 rounded-xl border bg-white p-4"
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
          <h3 className="col-span-2 font-semibold">Create staff login</h3>
          <input className="rounded border px-3 py-2" placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          <input className="rounded border px-3 py-2" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="rounded border px-3 py-2" placeholder="Temporary password" type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <select className="rounded border px-3 py-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="staff">staff</option>
            <option value="administrator">administrator</option>
          </select>
          {formError ? <p className="col-span-2 text-sm text-red-700">{formError}</p> : null}
          <button className="w-fit rounded bg-emerald-800 px-4 py-2 text-white" disabled={saving}>
            {saving ? 'Creating…' : 'Create account'}
          </button>
        </form>
      ) : null}
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.full_name}</td>
              <td>{r.email}</td>
              <td>
                <select
                  disabled={!isSuper}
                  value={r.role}
                  onChange={async (e) => {
                    await supabase.from('profiles').update({ role: e.target.value }).eq('id', r.id);
                    void reload();
                  }}
                >
                  {['visitor', 'donor', 'researcher', 'community_member', 'staff', 'administrator', 'super_admin'].map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </td>
              <td>
                <select
                  value={r.status}
                  onChange={async (e) => {
                    await supabase.from('profiles').update({ status: e.target.value }).eq('id', r.id);
                    void reload();
                  }}
                >
                  <option value="active">active</option>
                  <option value="suspended">suspended</option>
                  <option value="archived">archived</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
      <h2 className="mb-4 text-2xl font-semibold">Wildlife</h2>
      <form
        className="mb-6 grid grid-cols-2 gap-3 rounded-xl border bg-white p-4"
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
        <input className="rounded border px-3 py-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="rounded border px-3 py-2" placeholder="Scientific name" value={form.scientific_name} onChange={(e) => setForm({ ...form, scientific_name: e.target.value })} />
        <input className="rounded border px-3 py-2" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <input className="rounded border px-3 py-2" placeholder="Conservation status" value={form.conservation_status} onChange={(e) => setForm({ ...form, conservation_status: e.target.value })} />
        <input className="col-span-2 rounded border px-3 py-2" placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
        <textarea className="col-span-2 rounded border px-3 py-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
        <button className="rounded bg-emerald-800 px-4 py-2 text-white">Save species</button>
      </form>
      <table>
        <thead><tr><th>Name</th><th>Category</th><th>Status</th><th>Featured</th><th /></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r.id)}>
              <td>{String(r.name)}</td>
              <td>{String(r.category)}</td>
              <td>{String(r.conservation_status ?? '')}</td>
              <td>{r.featured ? 'Yes' : 'No'}</td>
              <td>
                <button className="text-red-700" onClick={async () => { await supabase.from('wildlife_species').delete().eq('id', r.id); void reload(); }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
      <h2 className="mb-4 text-2xl font-semibold">Tourism & accommodation</h2>
      <form
        className="mb-6 grid grid-cols-2 gap-3 rounded-xl border bg-white p-4"
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
        <input className="rounded border px-3 py-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input className="rounded border px-3 py-2" placeholder="Category / service type" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <input className="rounded border px-3 py-2" placeholder="Price KSh" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <input className="rounded border px-3 py-2" placeholder="Duration" value={form.duration_label} onChange={(e) => setForm({ ...form, duration_label: e.target.value })} />
        <input className="rounded border px-3 py-2" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
        <select className="rounded border px-3 py-2" value={form.pricing_unit} onChange={(e) => setForm({ ...form, pricing_unit: e.target.value })}>
          <option value="per_guest">per guest</option>
          <option value="per_booking">per booking (accommodation)</option>
        </select>
        <textarea className="col-span-2 rounded border px-3 py-2" placeholder="Summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        <button className="rounded bg-emerald-800 px-4 py-2 text-white">Save service</button>
      </form>
      <table>
        <thead><tr><th>Title</th><th>Type</th><th>Price</th><th>Capacity</th><th /></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r.id)}>
              <td>{String(r.title)}</td>
              <td>{String(r.category)}</td>
              <td>{formatCurrency(Number(r.price), String(r.currency ?? 'KES'))}</td>
              <td>{String(r.capacity)}</td>
              <td><button className="text-red-700" onClick={async () => { await supabase.from('tourism_services').delete().eq('id', r.id); void reload(); }}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
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
    <section>
      <h2 className="mb-4 text-2xl font-semibold">Bookings</h2>
      <table>
        <thead><tr><th>Ref</th><th>Service</th><th>Date</th><th>Guests</th><th>Amount</th><th>Status</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r.id)}>
              <td>{String(r.reference)}</td>
              <td>{String(r.service_title)}</td>
              <td>{formatDate(String(r.booking_date))}</td>
              <td>{String(r.guests)}</td>
              <td>{formatCurrency(Number(r.amount), String(r.currency))}</td>
              <td>
                <select value={String(r.status)} onChange={async (e) => { await supabase.from('bookings').update({ status: e.target.value }).eq('id', r.id); void reload(); }}>
                  {['pending_payment', 'payment_verification', 'confirmed', 'cancelled', 'completed', 'refunded'].map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
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
      <h2 className="mb-4 text-2xl font-semibold">Events</h2>
      <form className="mb-6 grid grid-cols-2 gap-3 rounded-xl border bg-white p-4" onSubmit={async (e) => {
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
        <input className="rounded border px-3 py-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input className="rounded border px-3 py-2" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <input className="rounded border px-3 py-2" type="datetime-local" value={form.start_at} onChange={(e) => setForm({ ...form, start_at: e.target.value })} required />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.registration_required} onChange={(e) => setForm({ ...form, registration_required: e.target.checked })} /> Registration required</label>
        <button className="rounded bg-emerald-800 px-4 py-2 text-white">Create event</button>
      </form>
      <table>
        <thead><tr><th>Title</th><th>When</th><th>Location</th><th /></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r.id)}>
              <td>{String(r.title)}</td>
              <td>{formatDate(String(r.start_at))}</td>
              <td>{String(r.location ?? '')}</td>
              <td><button className="text-red-700" onClick={async () => { await supabase.from('events').delete().eq('id', r.id); void reload(); }}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
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
      <h2 className="mb-4 text-2xl font-semibold">{title}</h2>
      <form className="mb-6 grid gap-3 rounded-xl border bg-white p-4" onSubmit={async (e) => {
        e.preventDefault();
        await supabase.from(table).insert({ id: form.title.toLowerCase().replace(/\s+/g, '-'), title: form.title, summary: form.summary, status: 'published' });
        setForm({ title: '', summary: '' });
        void reload();
      }}>
        <input className="rounded border px-3 py-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea className="rounded border px-3 py-2" placeholder="Summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        <button className="w-fit rounded bg-emerald-800 px-4 py-2 text-white">Add</button>
      </form>
      <table>
        <thead><tr><th>Title</th><th>Summary</th>{extra.map((c) => <th key={c}>{c}</th>)}<th /></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r.id)}>
              <td>{String(r.title)}</td>
              <td>{String(r.summary ?? '')}</td>
              {extra.map((c) => <td key={c}>{String(r[c] ?? '')}</td>)}
              <td><button className="text-red-700" onClick={async () => { await supabase.from(table).delete().eq('id', r.id); void reload(); }}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
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
        <h2 className="mb-4 text-2xl font-semibold">Campaigns</h2>
        <table>
          <thead><tr><th>Title</th><th>Raised</th><th>Goal</th><th>Active</th></tr></thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={String(c.id)}>
                <td>{String(c.title)}</td>
                <td>{formatCurrency(Number(c.amount_raised), String(c.currency))}</td>
                <td>{formatCurrency(Number(c.goal_amount), String(c.currency))}</td>
                <td>{c.active ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h3 className="mb-3 text-xl font-semibold">Individual gifts</h3>
        <table>
          <thead><tr><th>Amount</th><th>Status</th><th>Donor</th><th>When</th></tr></thead>
          <tbody>
            {gifts.map((g) => (
              <tr key={String(g.id)}>
                <td>{formatCurrency(Number(g.amount), String(g.currency))}</td>
                <td>{String(g.status)}</td>
                <td>{String(g.donor_name ?? g.donor_email ?? '—')}</td>
                <td>{formatDate(String(g.created_at))}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
    <section>
      <h2 className="mb-4 text-2xl font-semibold">Payments</h2>
      <table>
        <thead><tr><th>Reference</th><th>Amount</th><th>Status</th><th>Purpose</th><th>When</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r.id)}>
              <td>{String(r.reference)}</td>
              <td>{formatCurrency(Number(r.amount), String(r.currency))}</td>
              <td>{String(r.status)}</td>
              <td>{String(r.purpose ?? '')}</td>
              <td>{formatDate(String(r.created_at))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
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
      <h2 className="mb-4 text-2xl font-semibold">Notifications</h2>
      <form className="mb-6 space-y-3 rounded-xl border bg-white p-4" onSubmit={async (e) => {
        e.preventDefault();
        const { error } = await supabase.functions.invoke('admin-notify', { body: { title, message } });
        if (error) alert(error.message);
        setTitle('');
        setMessage('');
        void reload();
      }}>
        <input className="w-full rounded border px-3 py-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea className="w-full rounded border px-3 py-2" placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} required />
        <button className="rounded bg-emerald-800 px-4 py-2 text-white">Broadcast</button>
      </form>
      <table>
        <thead><tr><th>Title</th><th>Audience</th><th>When</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r.id)}>
              <td>{String(r.title)}</td>
              <td>{r.broadcast ? 'Everyone' : 'User'}</td>
              <td>{formatDate(String(r.created_at))}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
    <section>
      <h2 className="mb-4 text-2xl font-semibold">Feedback</h2>
      <table>
        <thead><tr><th>Subject</th><th>Category</th><th>Message</th><th>Status</th><th>Response</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r.id)}>
              <td>{String(r.subject)}</td>
              <td>{String(r.category)}</td>
              <td className="max-w-xs">{String(r.message)}</td>
              <td>
                <select value={String(r.status)} onChange={async (e) => { await supabase.from('feedback').update({ status: e.target.value }).eq('id', r.id); void reload(); }}>
                  <option>open</option>
                  <option>in_progress</option>
                  <option>resolved</option>
                  <option>closed</option>
                </select>
              </td>
              <td>
                <button className="text-emerald-800" onClick={async () => {
                  const admin_response = prompt('Response', String(r.admin_response ?? ''));
                  if (admin_response != null) {
                    await supabase.from('feedback').update({ admin_response, responded_at: new Date().toISOString() }).eq('id', r.id);
                    void reload();
                  }
                }}>Reply</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
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
    <section>
      <h2 className="mb-4 text-2xl font-semibold">Reports</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-stone-500">Verified payments</p>
          <p className="text-2xl font-semibold">{formatCurrency(total)}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-stone-500">Successful charges</p>
          <p className="text-2xl font-semibold">{success.length}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-stone-500">All payment rows</p>
          <p className="text-2xl font-semibold">{payments.length}</p>
        </div>
      </div>
    </section>
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
      <h2 className="text-2xl font-semibold">Content</h2>
      <div>
        <h3 className="mb-2 font-semibold">FAQs</h3>
        <table><thead><tr><th>Q</th><th>A</th></tr></thead><tbody>{faqs.map((f) => <tr key={String(f.id)}><td>{String(f.question)}</td><td>{String(f.answer)}</td></tr>)}</tbody></table>
      </div>
      <div>
        <h3 className="mb-2 font-semibold">Announcements</h3>
        <table><thead><tr><th>Title</th><th>Tone</th></tr></thead><tbody>{ann.map((a) => <tr key={String(a.id)}><td>{String(a.title)}</td><td>{String(a.tone)}</td></tr>)}</tbody></table>
      </div>
      <div>
        <h3 className="mb-2 font-semibold">About</h3>
        {about.map((s) => (
          <div key={String(s.key)} className="mb-3 rounded-xl border bg-white p-4">
            <p className="font-semibold">{String(s.title)}</p>
            <textarea className="mt-2 w-full rounded border p-2" defaultValue={String(s.body)} onBlur={async (e) => { await supabase.from('about_content').update({ body: e.target.value }).eq('key', s.key); }} />
          </div>
        ))}
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
    <section>
      <h2 className="mb-4 text-2xl font-semibold">Settings</h2>
      <textarea className="h-64 w-full rounded-xl border p-4 font-mono text-sm" value={value} onChange={(e) => setValue(e.target.value)} />
      <button className="mt-3 rounded bg-emerald-800 px-4 py-2 text-white" onClick={async () => {
        await supabase.from('site_settings').upsert({ key: 'general', value: JSON.parse(value) });
        alert('Saved');
      }}>Save</button>
    </section>
  );
}

function AuditPage() {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  useEffect(() => {
    void supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100).then(({ data }) => setRows(data ?? []));
  }, []);
  return (
    <section>
      <h2 className="mb-4 text-2xl font-semibold">Audit logs</h2>
      <table>
        <thead><tr><th>When</th><th>Action</th><th>Entity</th><th>Actor</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r.id)}>
              <td>{formatDate(String(r.created_at))}</td>
              <td>{String(r.action)}</td>
              <td>{String(r.entity_type)} {String(r.entity_id ?? '')}</td>
              <td>{String(r.actor_user_id ?? 'system')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
