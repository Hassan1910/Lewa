import { FormEvent, useEffect, useState } from 'react';
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
  TextArea,
} from './components/ui';
import { formatCurrency, formatDate } from './lib/format';
import { supabase } from './lib/supabase';

const PUBLISH_STATUSES = ['draft', 'published', 'archived'];

type Row = Record<string, unknown>;

function slugify(value: string) {
  const slug = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return slug || 'item';
}

function text(value: unknown) {
  return value == null ? '' : String(value);
}

function blankToNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function nairobiToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Nairobi' }).format(new Date());
}

function toDatetimeLocal(iso: string) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-full">{message}</p>;
}

function ImageUrlField({
  label,
  bucket,
  value,
  onChange,
}: {
  label: string;
  bucket: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="space-y-2 sm:col-span-2">
      <Field label={`${label} URL`} value={value} placeholder="Paste an image URL" onChange={(e) => onChange(e.target.value)} />
      <label className="block text-sm font-medium text-stone-700">
        <span>Or upload to {bucket}</span>
        <input
          type="file"
          accept="image/*"
          disabled={uploading}
          className="mt-1.5 block w-full text-sm text-stone-600"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (!file) return;
            setUploading(true);
            setError(null);
            const safeName = file.name.replace(/[^\w.]+/g, '_');
            const path = `${crypto.randomUUID()}-${safeName}`;
            void supabase.storage
              .from(bucket)
              .upload(path, file, { contentType: file.type || undefined, upsert: false })
              .then(({ error: uploadError }) => {
                setUploading(false);
                if (uploadError) {
                  setError(uploadError.message);
                  return;
                }
                const { data } = supabase.storage.from(bucket).getPublicUrl(path);
                onChange(data.publicUrl);
              });
          }}
        />
      </label>
      {uploading ? <p className="text-sm text-stone-500">Uploading…</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}

function PublishField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <SelectField label="Publish state" value={value} onChange={(e) => onChange(e.target.value)}>
      {PUBLISH_STATUSES.map((status) => (
        <option key={status} value={status}>{humanize(status)}</option>
      ))}
    </SelectField>
  );
}

export function WildlifePage() {
  const empty = { name: '', scientific_name: '', category: 'Mammals', conservation_status: 'Endangered', description: '', image_url: '', featured: false, status: 'published' };
  const [rows, setRows] = useState<Row[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    const { data, error: loadError } = await supabase.from('wildlife_species').select('*').order('name');
    if (loadError) setError(loadError.message);
    setRows(data ?? []);
  };
  useEffect(() => { void reload(); }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = {
      id: editingId ?? slugify(form.name),
      name: form.name.trim(),
      scientific_name: blankToNull(form.scientific_name),
      category: form.category.trim() || 'Mammals',
      conservation_status: blankToNull(form.conservation_status),
      description: blankToNull(form.description),
      image_url: blankToNull(form.image_url),
      featured: form.featured,
      status: form.status,
    };
    const { error: saveError } = await supabase.from('wildlife_species').upsert(payload);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setEditingId(null);
    setForm(empty);
    await reload();
  };

  return (
    <section>
      <FormCard onSubmit={(e) => void onSubmit(e)}>
        <Field label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Field label="Scientific name" value={form.scientific_name} onChange={(e) => setForm({ ...form, scientific_name: e.target.value })} />
        <Field label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <Field label="Conservation status" value={form.conservation_status} onChange={(e) => setForm({ ...form, conservation_status: e.target.value })} />
        <PublishField value={form.status} onChange={(status) => setForm({ ...form, status })} />
        <CheckField label="Featured" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
        <ImageUrlField label="Image" bucket="wildlife" value={form.image_url} onChange={(image_url) => setForm({ ...form, image_url })} />
        <TextArea className="sm:col-span-2" label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <FormError message={error} />
        <div className="flex items-end gap-2 sm:col-span-2">
          <Button type="submit">{editingId ? 'Save changes' : 'Save species'}</Button>
          {editingId ? <Button type="button" tone="ghost" onClick={() => { setEditingId(null); setForm(empty); setError(null); }}>Cancel</Button> : null}
        </div>
      </FormCard>
      <DataTable>
        <thead><tr><th>Name</th><th>Category</th><th>Publish</th><th>Featured</th><th /></tr></thead>
        <tbody>
          {rows.length === 0 ? <EmptyRow colSpan={5} label="No species yet." /> : rows.map((r) => (
            <tr key={text(r.id)}>
              <td className="font-medium">{text(r.name)}</td>
              <td>{text(r.category)}</td>
              <td><Badge value={text(r.status)} /></td>
              <td><Badge value={r.featured ? 'yes' : 'no'} /></td>
              <td className="space-x-2 whitespace-nowrap">
                <Button type="button" tone="ghost" className="px-3 py-1.5" onClick={() => {
                  setEditingId(text(r.id));
                  setError(null);
                  setForm({
                    name: text(r.name),
                    scientific_name: text(r.scientific_name),
                    category: text(r.category),
                    conservation_status: text(r.conservation_status),
                    description: text(r.description),
                    image_url: text(r.image_url),
                    featured: Boolean(r.featured),
                    status: text(r.status || 'published'),
                  });
                }}>Edit</Button>
                <Button type="button" tone="danger" className="px-3 py-1.5" onClick={() => void deleteRow('wildlife_species', text(r.id), reload, setError)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </section>
  );
}

export function TourismPage() {
  const empty = { title: '', category: 'Safari', price: '18000', duration_label: '3 hrs', capacity: '6', summary: '', pricing_unit: 'per_guest', image_url: '', status: 'published' };
  const [rows, setRows] = useState<Row[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [datesFor, setDatesFor] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    const { data, error: loadError } = await supabase.from('tourism_services').select('*').order('title');
    if (loadError) setError(loadError.message);
    setRows(data ?? []);
  };
  useEffect(() => { void reload(); }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const price = Number(form.price);
    const capacity = Number(form.capacity);
    if (!Number.isFinite(price) || price < 0 || !Number.isFinite(capacity) || capacity < 1) {
      setError('Enter a price and a capacity of at least 1.');
      return;
    }
    const id = editingId ?? slugify(form.title);
    const { error: saveError } = await supabase.from('tourism_services').upsert({
      id,
      title: form.title.trim(),
      category: form.category.trim() || 'Safari',
      service_type: form.category.trim() || 'Safari',
      price,
      currency: 'KES',
      duration_label: blankToNull(form.duration_label),
      capacity,
      summary: blankToNull(form.summary),
      pricing_unit: form.pricing_unit,
      image_url: blankToNull(form.image_url),
      status: form.status,
    });
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setEditingId(null);
    setForm(empty);
    await reload();
  };

  const selected = rows.find((row) => text(row.id) === datesFor);

  return (
    <section>
      <FormCard onSubmit={(e) => void onSubmit(e)}>
        <Field label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <Field label="Category / service type" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <Field label="Price (KSh)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        <Field label="Duration" value={form.duration_label} onChange={(e) => setForm({ ...form, duration_label: e.target.value })} />
        <Field label="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
        <SelectField label="Pricing" value={form.pricing_unit} onChange={(e) => setForm({ ...form, pricing_unit: e.target.value })}>
          <option value="per_guest">per guest</option>
          <option value="per_booking">per booking (accommodation)</option>
        </SelectField>
        <PublishField value={form.status} onChange={(status) => setForm({ ...form, status })} />
        <ImageUrlField label="Image" bucket="tourism" value={form.image_url} onChange={(image_url) => setForm({ ...form, image_url })} />
        <TextArea className="sm:col-span-2" label="Summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        <FormError message={error} />
        <div className="flex items-end gap-2 sm:col-span-2">
          <Button type="submit">{editingId ? 'Save changes' : 'Save service'}</Button>
          {editingId ? <Button type="button" tone="ghost" onClick={() => { setEditingId(null); setForm(empty); setError(null); }}>Cancel</Button> : null}
        </div>
      </FormCard>
      <DataTable>
        <thead><tr><th>Title</th><th>Type</th><th>Price</th><th>Capacity</th><th>Publish</th><th /></tr></thead>
        <tbody>
          {rows.length === 0 ? <EmptyRow colSpan={6} label="No services yet." /> : rows.map((r) => (
            <tr key={text(r.id)}>
              <td className="font-medium">{text(r.title)}</td>
              <td>{text(r.category)}</td>
              <td>{formatCurrency(Number(r.price), text(r.currency || 'KES'))}</td>
              <td>{text(r.capacity)}</td>
              <td><Badge value={text(r.status)} /></td>
              <td className="space-x-2 whitespace-nowrap">
                <Button type="button" tone="ghost" className="px-3 py-1.5" onClick={() => {
                  setEditingId(text(r.id));
                  setError(null);
                  setForm({
                    title: text(r.title),
                    category: text(r.category),
                    price: text(r.price),
                    duration_label: text(r.duration_label),
                    capacity: text(r.capacity),
                    summary: text(r.summary),
                    pricing_unit: text(r.pricing_unit || 'per_guest'),
                    image_url: text(r.image_url),
                    status: text(r.status || 'published'),
                  });
                }}>Edit</Button>
                <Button type="button" tone="ghost" className="px-3 py-1.5" onClick={() => setDatesFor(datesFor === text(r.id) ? null : text(r.id))}>Dates</Button>
                <Button type="button" tone="danger" className="px-3 py-1.5" onClick={() => void deleteRow('tourism_services', text(r.id), reload, setError)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
      {selected ? (
        <AvailabilityEditor
          serviceId={text(selected.id)}
          serviceTitle={text(selected.title)}
          defaultCapacity={Number(selected.capacity) || 1}
        />
      ) : null}
    </section>
  );
}

function AvailabilityEditor({ serviceId, serviceTitle, defaultCapacity }: { serviceId: string; serviceTitle: string; defaultCapacity: number }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { remaining: string; status: string }>>({});
  const [date, setDate] = useState('');
  const [remaining, setRemaining] = useState(String(defaultCapacity));
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    const { data, error: loadError } = await supabase
      .from('service_availability')
      .select('*')
      .eq('service_id', serviceId)
      .gte('date', nairobiToday())
      .order('date');
    if (loadError) {
      setError(loadError.message);
      return;
    }
    const next = data ?? [];
    setRows(next);
    setDrafts(Object.fromEntries(next.map((row) => [text(row.id), { remaining: text(row.remaining_capacity), status: text(row.status || 'open') }])));
  };

  useEffect(() => {
    setRemaining(String(defaultCapacity));
    void reload();
  }, [serviceId, defaultCapacity]);

  const addDate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const seats = Number(remaining);
    if (!date || !Number.isInteger(seats) || seats < 0) {
      setError('Choose a date and a whole number of seats.');
      return;
    }
    const { data: existing, error: existingError } = await supabase
      .from('service_availability')
      .select('id')
      .eq('service_id', serviceId)
      .eq('date', date)
      .is('start_time', null)
      .maybeSingle();
    if (existingError) {
      setError(existingError.message);
      return;
    }
    if (existing) {
      setError('That date already has an all-day slot. Change it in the list below.');
      return;
    }
    const { error: insertError } = await supabase.from('service_availability').insert({
      service_id: serviceId,
      date,
      start_time: null,
      capacity: Math.max(defaultCapacity, seats),
      remaining_capacity: seats,
      status: seats > 0 ? 'open' : 'closed',
    });
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setDate('');
    await reload();
  };

  const saveRow = async (row: Row) => {
    setError(null);
    const draft = drafts[text(row.id)];
    if (!draft) return;
    const seats = Number(draft.remaining);
    if (!Number.isInteger(seats) || seats < 0) {
      setError('Remaining capacity must be a whole number.');
      return;
    }
    if (draft.status !== 'open' && draft.status !== 'closed') {
      setError('Status must be open or closed.');
      return;
    }
    const { error: saveError } = await supabase.from('service_availability').update({
      remaining_capacity: seats,
      capacity: Math.max(Number(row.capacity) || 0, seats),
      status: draft.status,
    }).eq('id', row.id);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    await reload();
  };

  return (
    <Card className="mt-6" title={`Dates for ${serviceTitle}`} description="A booking is rejected unless this service has an all-day slot for that date. Adding a date creates the slot first." bodyClassName="p-5">
      <form onSubmit={(e) => void addDate(e)} className="mb-4 grid gap-3 sm:grid-cols-4">
        <Field label="Date" type="date" value={date} min={nairobiToday()} onChange={(e) => setDate(e.target.value)} required />
        <Field label="Remaining seats" value={remaining} onChange={(e) => setRemaining(e.target.value)} />
        <div className="flex items-end sm:col-span-2">
          <Button type="submit">Add date</Button>
        </div>
        <FormError message={error} />
      </form>
      <DataTable>
        <thead><tr><th>Date</th><th>Start</th><th>Remaining</th><th>Status</th><th /></tr></thead>
        <tbody>
          {rows.length === 0 ? <EmptyRow colSpan={5} label="No upcoming dates. Add one before guests can book it." /> : rows.map((row) => {
            const draft = drafts[text(row.id)] ?? { remaining: text(row.remaining_capacity), status: text(row.status) };
            return (
              <tr key={text(row.id)}>
                <td className="font-medium">{text(row.date)}</td>
                <td>{row.start_time == null ? 'All day' : text(row.start_time)}</td>
                <td>
                  <input
                    value={draft.remaining}
                    onChange={(e) => setDrafts({ ...drafts, [text(row.id)]: { ...draft, remaining: e.target.value } })}
                    className="w-24 rounded-xl border border-stone-200 px-2 py-1.5 text-sm"
                  />
                </td>
                <td>
                  <SelectField compact value={draft.status} onChange={(e) => setDrafts({ ...drafts, [text(row.id)]: { ...draft, status: e.target.value } })}>
                    <option value="open">open</option>
                    <option value="closed">closed</option>
                  </SelectField>
                </td>
                <td><Button type="button" tone="ghost" className="px-3 py-1.5" onClick={() => void saveRow(row)}>Save</Button></td>
              </tr>
            );
          })}
        </tbody>
      </DataTable>
    </Card>
  );
}

export function EventsPage() {
  const empty = { title: '', location: '', start_at: '', description: '', capacity: '', registration_required: true, image_url: '', status: 'published' };
  const [rows, setRows] = useState<Row[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rosterFor, setRosterFor] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    const { data, error: loadError } = await supabase.from('events').select('*').order('start_at');
    if (loadError) setError(loadError.message);
    setRows(data ?? []);
  };
  useEffect(() => { void reload(); }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const start = new Date(form.start_at);
    if (Number.isNaN(start.getTime())) {
      setError('Enter a valid start time.');
      return;
    }
    const capacity = form.capacity.trim() === '' ? null : Number(form.capacity);
    if (capacity != null && (!Number.isInteger(capacity) || capacity < 0)) {
      setError('Capacity must be a whole number, or blank for no limit.');
      return;
    }
    const payload = {
      id: editingId ?? slugify(form.title),
      title: form.title.trim(),
      location: blankToNull(form.location),
      start_at: start.toISOString(),
      description: blankToNull(form.description),
      capacity,
      registration_required: form.registration_required,
      image_url: blankToNull(form.image_url),
      status: form.status,
    };
    const query = editingId
      ? supabase.from('events').update(payload).eq('id', editingId)
      : supabase.from('events').insert(payload);
    const { error: saveError } = await query;
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setEditingId(null);
    setForm(empty);
    await reload();
  };

  const selected = rows.find((row) => text(row.id) === rosterFor);

  return (
    <section>
      <FormCard onSubmit={(e) => void onSubmit(e)}>
        <Field label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <Field label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <Field label="Starts" type="datetime-local" value={form.start_at} onChange={(e) => setForm({ ...form, start_at: e.target.value })} required />
        <Field label="Capacity" value={form.capacity} placeholder="Blank means unlimited" onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
        <PublishField value={form.status} onChange={(status) => setForm({ ...form, status })} />
        <CheckField label="Registration required" checked={form.registration_required} onChange={(e) => setForm({ ...form, registration_required: e.target.checked })} />
        <ImageUrlField label="Image" bucket="events" value={form.image_url} onChange={(image_url) => setForm({ ...form, image_url })} />
        <TextArea className="sm:col-span-2" label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <FormError message={error} />
        <div className="flex items-end gap-2 sm:col-span-2">
          <Button type="submit">{editingId ? 'Save changes' : 'Create event'}</Button>
          {editingId ? <Button type="button" tone="ghost" onClick={() => { setEditingId(null); setForm(empty); setError(null); }}>Cancel</Button> : null}
        </div>
      </FormCard>
      <DataTable>
        <thead><tr><th>Title</th><th>When</th><th>Location</th><th>Capacity</th><th>Publish</th><th /></tr></thead>
        <tbody>
          {rows.length === 0 ? <EmptyRow colSpan={6} label="No events yet." /> : rows.map((r) => (
            <tr key={text(r.id)}>
              <td className="font-medium">{text(r.title)}</td>
              <td>{formatDate(text(r.start_at))}</td>
              <td>{text(r.location)}</td>
              <td>{r.capacity == null ? 'Unlimited' : text(r.capacity)}</td>
              <td><Badge value={text(r.status)} /></td>
              <td className="space-x-2 whitespace-nowrap">
                <Button type="button" tone="ghost" className="px-3 py-1.5" onClick={() => {
                  setEditingId(text(r.id));
                  setError(null);
                  setForm({
                    title: text(r.title),
                    location: text(r.location),
                    start_at: toDatetimeLocal(text(r.start_at)),
                    description: text(r.description),
                    capacity: r.capacity == null ? '' : text(r.capacity),
                    registration_required: Boolean(r.registration_required),
                    image_url: text(r.image_url),
                    status: text(r.status || 'published'),
                  });
                }}>Edit</Button>
                <Button type="button" tone="ghost" className="px-3 py-1.5" onClick={() => setRosterFor(rosterFor === text(r.id) ? null : text(r.id))}>Roster</Button>
                <Button type="button" tone="danger" className="px-3 py-1.5" onClick={() => void deleteRow('events', text(r.id), reload, setError)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
      {selected ? <EventRoster eventId={text(selected.id)} title={text(selected.title)} capacity={selected.capacity == null ? null : Number(selected.capacity)} /> : null}
    </section>
  );
}

function EventRoster({ eventId, title, capacity }: { eventId: string; title: string; capacity: number | null }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    void supabase
      .from('event_registrations')
      .select('id, full_name, email, status, created_at')
      .eq('event_id', eventId)
      .order('created_at')
      .then(({ data, error: loadError }) => {
        if (loadError) setError(loadError.message);
        setRows(data ?? []);
      });
  }, [eventId]);
  const holding = rows.filter((row) => row.status === 'registered' || row.status === 'attended').length;
  const capacityLabel = capacity == null ? 'No capacity limit' : `${holding} of ${capacity} seats taken`;
  return (
    <Card className="mt-6" title={`Registrations · ${title}`} description={capacityLabel} bodyClassName="p-0">
      {error ? <p className="px-5 py-3 text-sm text-red-700">{error}</p> : null}
      <DataTable>
        <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Registered</th></tr></thead>
        <tbody>
          {rows.length === 0 ? <EmptyRow colSpan={4} label="No registrations yet." /> : rows.map((row) => (
            <tr key={text(row.id)}>
              <td className="font-medium">{text(row.full_name)}</td>
              <td>{text(row.email) || '—'}</td>
              <td><Badge value={text(row.status)} /></td>
              <td>{formatDate(text(row.created_at))}</td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </Card>
  );
}

export function SimpleContent({ table, title, extra = [], imageBucket }: { table: string; title: string; extra?: string[]; imageBucket?: string }) {
  const blankExtra = Object.fromEntries(extra.map((column) => [column, '']));
  const empty = { title: '', summary: '', status: 'published', cover_image: '', extra: blankExtra };
  const [rows, setRows] = useState<Row[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    const { data, error: loadError } = await supabase.from(table).select('*').order('title');
    if (loadError) setError(loadError.message);
    setRows(data ?? []);
  };
  useEffect(() => {
    setEditingId(null);
    setForm({ title: '', summary: '', status: 'published', cover_image: '', extra: Object.fromEntries(extra.map((column) => [column, ''])) });
    void reload();
  }, [table]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload: Row = {
      id: editingId ?? slugify(form.title),
      title: form.title.trim(),
      summary: blankToNull(form.summary),
      status: form.status,
    };
    if (imageBucket) payload.cover_image = blankToNull(form.cover_image);
    for (const column of extra) {
      const raw = form.extra[column] ?? '';
      if (column === 'reading_minutes') {
        payload[column] = raw.trim() === '' ? null : Number(raw);
      } else {
        payload[column] = blankToNull(raw);
      }
    }
    const query = editingId
      ? supabase.from(table).update(payload).eq('id', editingId)
      : supabase.from(table).insert(payload);
    const { error: saveError } = await query;
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setEditingId(null);
    setForm({ ...empty, extra: Object.fromEntries(extra.map((column) => [column, ''])) });
    await reload();
  };

  return (
    <section>
      <FormCard columns={1} title={editingId ? `Edit ${title.toLowerCase()}` : `Add ${title.toLowerCase()}`} onSubmit={(e) => void onSubmit(e)}>
        <Field label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <TextArea label="Summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        {extra.map((column) => (
          <Field
            key={column}
            label={humanize(column)}
            value={form.extra[column] ?? ''}
            onChange={(e) => setForm({ ...form, extra: { ...form.extra, [column]: e.target.value } })}
          />
        ))}
        <PublishField value={form.status} onChange={(status) => setForm({ ...form, status })} />
        {imageBucket ? <ImageUrlField label="Cover image" bucket={imageBucket} value={form.cover_image} onChange={(cover_image) => setForm({ ...form, cover_image })} /> : null}
        <FormError message={error} />
        <div className="flex gap-2">
          <Button type="submit">{editingId ? 'Save changes' : 'Add'}</Button>
          {editingId ? <Button type="button" tone="ghost" onClick={() => { setEditingId(null); setForm({ ...empty, extra: { ...blankExtra } }); setError(null); }}>Cancel</Button> : null}
        </div>
      </FormCard>
      <DataTable>
        <thead><tr><th>Title</th><th>Summary</th><th>Publish</th>{extra.map((c) => <th key={c}>{humanize(c)}</th>)}<th /></tr></thead>
        <tbody>
          {rows.length === 0 ? <EmptyRow colSpan={4 + extra.length} label={`No ${title.toLowerCase()} yet.`} /> : rows.map((r) => (
            <tr key={text(r.id)}>
              <td className="font-medium">{text(r.title)}</td>
              <td className="max-w-sm whitespace-normal">{text(r.summary)}</td>
              <td><Badge value={text(r.status)} /></td>
              {extra.map((c) => <td key={c}>{text(r[c])}</td>)}
              <td className="space-x-2 whitespace-nowrap">
                <Button type="button" tone="ghost" className="px-3 py-1.5" onClick={() => {
                  setEditingId(text(r.id));
                  setError(null);
                  setForm({
                    title: text(r.title),
                    summary: text(r.summary),
                    status: text(r.status || 'published'),
                    cover_image: text(r.cover_image),
                    extra: Object.fromEntries(extra.map((column) => [column, text(r[column])])),
                  });
                }}>Edit</Button>
                <Button type="button" tone="danger" className="px-3 py-1.5" onClick={() => void deleteRow(table, text(r.id), reload, setError)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </section>
  );
}

export function DonationsPage() {
  const empty = { title: '', summary: '', goal_amount: '', suggested_amounts: '', active: true, status: 'published' };
  const [campaigns, setCampaigns] = useState<Row[]>([]);
  const [gifts, setGifts] = useState<Row[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    const [campaignResult, giftResult] = await Promise.all([
      supabase.from('donation_campaigns').select('*').order('title'),
      supabase.from('donations').select('*').order('created_at', { ascending: false }),
    ]);
    if (campaignResult.error) setError(campaignResult.error.message);
    if (giftResult.error) setError(giftResult.error.message);
    setCampaigns(campaignResult.data ?? []);
    setGifts(giftResult.data ?? []);
  };
  useEffect(() => { void reload(); }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const goal = Number(form.goal_amount);
    if (!Number.isFinite(goal) || goal < 0) {
      setError('Enter a goal amount.');
      return;
    }
    const suggested = form.suggested_amounts.split(/[,\s]+/).map((part) => part.trim()).filter(Boolean).map(Number);
    if (suggested.some((amount) => !Number.isFinite(amount) || amount <= 0)) {
      setError('Suggested amounts must be positive numbers, separated by commas.');
      return;
    }
    const payload = {
      id: editingId ?? slugify(form.title),
      title: form.title.trim(),
      summary: blankToNull(form.summary),
      goal_amount: goal,
      suggested_amounts: suggested,
      active: form.active,
      status: form.status,
      currency: 'KES',
    };
    const query = editingId
      ? supabase.from('donation_campaigns').update(payload).eq('id', editingId)
      : supabase.from('donation_campaigns').insert(payload);
    const { error: saveError } = await query;
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setEditingId(null);
    setForm(empty);
    await reload();
  };

  return (
    <section className="space-y-8">
      <div>
        <SectionHeading title="Campaigns" />
        <FormCard onSubmit={(e) => void onSubmit(e)}>
          <Field label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Field label="Goal (KSh)" value={form.goal_amount} onChange={(e) => setForm({ ...form, goal_amount: e.target.value })} required />
          <Field className="sm:col-span-2" label="Suggested amounts" placeholder="500, 2000, 5000" value={form.suggested_amounts} onChange={(e) => setForm({ ...form, suggested_amounts: e.target.value })} />
          <TextArea className="sm:col-span-2" label="Summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          <PublishField value={form.status} onChange={(status) => setForm({ ...form, status })} />
          <CheckField label="Active" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          <FormError message={error} />
          <div className="flex items-end gap-2 sm:col-span-2">
            <Button type="submit">{editingId ? 'Save campaign' : 'Create campaign'}</Button>
            {editingId ? <Button type="button" tone="ghost" onClick={() => { setEditingId(null); setForm(empty); setError(null); }}>Cancel</Button> : null}
          </div>
        </FormCard>
        <DataTable>
          <thead><tr><th>Title</th><th>Raised</th><th>Goal</th><th>Active</th><th>Publish</th><th /></tr></thead>
          <tbody>
            {campaigns.length === 0 ? <EmptyRow colSpan={6} label="No campaigns yet." /> : campaigns.map((c) => (
              <tr key={text(c.id)}>
                <td className="font-medium">{text(c.title)}</td>
                <td>{formatCurrency(Number(c.amount_raised), text(c.currency))}</td>
                <td>{formatCurrency(Number(c.goal_amount), text(c.currency))}</td>
                <td><Badge value={c.active ? 'yes' : 'no'} /></td>
                <td><Badge value={text(c.status)} /></td>
                <td>
                  <Button type="button" tone="ghost" className="px-3 py-1.5" onClick={() => {
                    const amounts = Array.isArray(c.suggested_amounts) ? c.suggested_amounts.map((amount) => text(amount)).join(', ') : '';
                    setEditingId(text(c.id));
                    setError(null);
                    setForm({
                      title: text(c.title),
                      summary: text(c.summary),
                      goal_amount: text(c.goal_amount),
                      suggested_amounts: amounts,
                      active: Boolean(c.active),
                      status: text(c.status || 'published'),
                    });
                  }}>Edit</Button>
                </td>
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
              <tr key={text(g.id)}>
                <td className="font-medium">{formatCurrency(Number(g.amount), text(g.currency))}</td>
                <td><Badge value={text(g.status)} /></td>
                <td>{text(g.donor_name || g.donor_email || '—')}</td>
                <td>{formatDate(text(g.created_at))}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </div>
    </section>
  );
}

export function ContentPage() {
  const [faqs, setFaqs] = useState<Row[]>([]);
  const [ann, setAnn] = useState<Row[]>([]);
  const [about, setAbout] = useState<Row[]>([]);
  const [faqForm, setFaqForm] = useState({ category: 'General', question: '', answer: '', sort_order: '0', status: 'published' });
  const [faqId, setFaqId] = useState<string | null>(null);
  const [annForm, setAnnForm] = useState({ title: '', body: '', tone: 'default', status: 'published' });
  const [annId, setAnnId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    const [f, a, ab] = await Promise.all([
      supabase.from('faqs').select('*').order('sort_order'),
      supabase.from('announcements').select('*').order('publish_at', { ascending: false }),
      supabase.from('about_content').select('*').order('sort_order'),
    ]);
    if (f.error || a.error || ab.error) setError(f.error?.message || a.error?.message || ab.error?.message || 'Could not load content');
    setFaqs(f.data ?? []);
    setAnn(a.data ?? []);
    setAbout(ab.data ?? []);
  };
  useEffect(() => { void reload(); }, []);

  const saveFaq = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const sort = Number(faqForm.sort_order);
    if (!Number.isFinite(sort)) {
      setError('Sort order must be a number.');
      return;
    }
    const payload = {
      id: faqId ?? slugify(faqForm.question),
      category: faqForm.category.trim() || 'General',
      question: faqForm.question.trim(),
      answer: faqForm.answer.trim(),
      sort_order: sort,
      status: faqForm.status,
    };
    const query = faqId ? supabase.from('faqs').update(payload).eq('id', faqId) : supabase.from('faqs').insert(payload);
    const { error: saveError } = await query;
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setFaqId(null);
    setFaqForm({ category: 'General', question: '', answer: '', sort_order: '0', status: 'published' });
    await reload();
  };

  const saveAnnouncement = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = {
      id: annId ?? slugify(annForm.title),
      title: annForm.title.trim(),
      body: annForm.body.trim(),
      tone: annForm.tone,
      status: annForm.status,
    };
    const query = annId
      ? supabase.from('announcements').update(payload).eq('id', annId)
      : supabase.from('announcements').insert(payload);
    const { error: saveError } = await query;
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setAnnId(null);
    setAnnForm({ title: '', body: '', tone: 'default', status: 'published' });
    await reload();
  };

  return (
    <section className="space-y-8">
      {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <div>
        <SectionHeading title="FAQs" />
        <FormCard onSubmit={(e) => void saveFaq(e)}>
          <Field label="Category" value={faqForm.category} onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })} />
          <Field label="Sort order" value={faqForm.sort_order} onChange={(e) => setFaqForm({ ...faqForm, sort_order: e.target.value })} />
          <Field className="sm:col-span-2" label="Question" value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} required />
          <TextArea className="sm:col-span-2" label="Answer" value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} required />
          <PublishField value={faqForm.status} onChange={(status) => setFaqForm({ ...faqForm, status })} />
          <div className="flex items-end gap-2">
            <Button type="submit">{faqId ? 'Save FAQ' : 'Add FAQ'}</Button>
            {faqId ? <Button type="button" tone="ghost" onClick={() => { setFaqId(null); setFaqForm({ category: 'General', question: '', answer: '', sort_order: '0', status: 'published' }); }}>Cancel</Button> : null}
          </div>
        </FormCard>
        <DataTable>
          <thead><tr><th>Question</th><th>Answer</th><th>Publish</th><th /></tr></thead>
          <tbody>
            {faqs.length === 0 ? <EmptyRow colSpan={4} label="No FAQs yet." /> : faqs.map((f) => (
              <tr key={text(f.id)}>
                <td className="font-medium">{text(f.question)}</td>
                <td className="max-w-md whitespace-normal text-stone-600">{text(f.answer)}</td>
                <td><Badge value={text(f.status)} /></td>
                <td><Button type="button" tone="ghost" className="px-3 py-1.5" onClick={() => {
                  setFaqId(text(f.id));
                  setFaqForm({
                    category: text(f.category),
                    question: text(f.question),
                    answer: text(f.answer),
                    sort_order: text(f.sort_order || 0),
                    status: text(f.status || 'published'),
                  });
                }}>Edit</Button></td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </div>
      <div>
        <SectionHeading title="Announcements" />
        <FormCard onSubmit={(e) => void saveAnnouncement(e)}>
          <Field label="Title" value={annForm.title} onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })} required />
          <SelectField label="Tone" value={annForm.tone} onChange={(e) => setAnnForm({ ...annForm, tone: e.target.value })}>
            <option value="default">default</option>
            <option value="urgent">urgent</option>
          </SelectField>
          <TextArea className="sm:col-span-2" label="Body" value={annForm.body} onChange={(e) => setAnnForm({ ...annForm, body: e.target.value })} required />
          <PublishField value={annForm.status} onChange={(status) => setAnnForm({ ...annForm, status })} />
          <div className="flex items-end gap-2">
            <Button type="submit">{annId ? 'Save announcement' : 'Add announcement'}</Button>
            {annId ? <Button type="button" tone="ghost" onClick={() => { setAnnId(null); setAnnForm({ title: '', body: '', tone: 'default', status: 'published' }); }}>Cancel</Button> : null}
          </div>
        </FormCard>
        <DataTable>
          <thead><tr><th>Title</th><th>Tone</th><th>Publish</th><th /></tr></thead>
          <tbody>
            {ann.length === 0 ? <EmptyRow colSpan={4} label="No announcements yet." /> : ann.map((a) => (
              <tr key={text(a.id)}>
                <td className="font-medium">{text(a.title)}</td>
                <td><Badge value={text(a.tone)} /></td>
                <td><Badge value={text(a.status)} /></td>
                <td><Button type="button" tone="ghost" className="px-3 py-1.5" onClick={() => {
                  setAnnId(text(a.id));
                  setAnnForm({ title: text(a.title), body: text(a.body), tone: text(a.tone || 'default'), status: text(a.status || 'published') });
                }}>Edit</Button></td>
              </tr>
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
            <Card key={text(s.key)} title={text(s.title)} bodyClassName="p-5">
              <TextArea defaultValue={text(s.body)} onBlur={(e) => {
                void supabase.from('about_content').update({ body: e.target.value }).eq('key', s.key).then(({ error: saveError }) => {
                  if (saveError) setError(saveError.message);
                });
              }} />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

async function deleteRow(table: string, id: string, reload: () => Promise<void>, setError: (message: string | null) => void) {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) {
    setError(error.message);
    return;
  }
  setError(null);
  await reload();
}
