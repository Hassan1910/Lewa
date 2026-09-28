import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Icon } from '../components/icons';
import { Badge, Button, Card, DataTable, EmptyRow, Field, humanize, StatCard } from '../components/ui';
import { formatCurrency } from '../lib/format';
import {
  dailyCollections,
  downloadCsv,
  filterPayments,
  loadPayments,
  paymentBreakdown,
  paymentTotals,
  paymentsToCsv,
  rangeForPreset,
  type PaymentRecord,
  type ReportPreset,
} from '../lib/payments';

const PRESETS: { id: ReportPreset; label: string }[] = [
  { id: 'month', label: 'This month' },
  { id: '7d', label: 'Last 7 days' },
  { id: 'all', label: 'All time' },
  { id: 'custom', label: 'Custom' },
];

export function ReportsPage() {
  const [rows, setRows] = useState<PaymentRecord[]>([]);
  const [preset, setPreset] = useState<ReportPreset>('month');
  const [from, setFrom] = useState(() => rangeForPreset('month').from);
  const [to, setTo] = useState(() => rangeForPreset('month').to);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadPayments()
      .then((payments) => {
        if (active) setRows(payments);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Could not load payments');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const choosePreset = (next: ReportPreset) => {
    setPreset(next);
    if (next === 'month' || next === '7d') {
      const range = rangeForPreset(next);
      setFrom(range.from);
      setTo(range.to);
    }
    if (next === 'all') {
      setFrom('');
      setTo('');
    }
  };

  const visible = useMemo(
    () => filterPayments(rows, { search: '', status: '', purpose: '', from, to }),
    [rows, from, to],
  );
  const totals = useMemo(() => paymentTotals(visible), [visible]);
  const chart = useMemo(() => dailyCollections(visible), [visible]);
  const breakdown = useMemo(() => paymentBreakdown(visible), [visible]);

  const exportCsv = () => {
    const span = from && to ? `${from}-to-${to}` : 'all-time';
    downloadCsv(`lewa-payment-report-${span}.csv`, paymentsToCsv(visible));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((item) => (
            <Button
              key={item.id}
              type="button"
              tone={preset === item.id ? 'primary' : 'ghost'}
              className="px-3 py-1.5"
              onClick={() => choosePreset(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>
        <Button type="button" tone="ghost" onClick={exportCsv} disabled={visible.length === 0}>
          Export CSV
        </Button>
      </div>

      {preset === 'custom' ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="From" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          <Field label="To" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        </div>
      ) : null}

      {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Collected" value={loading ? '—' : formatCurrency(totals.collected, totals.currency)} icon="card" />
        <StatCard label="Successful" value={loading ? '—' : totals.successCount} icon="chart" />
        <StatCard label="Failed" value={loading ? '—' : totals.failedCount} icon="message" />
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">Bookings / gifts</p>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-800">
              <Icon name="heart" className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-lg font-semibold tracking-tight text-stone-900">
            {loading ? '—' : formatCurrency(totals.bookingCollected, totals.currency)}
            <span className="mt-1 block text-sm font-medium text-stone-500">
              {loading ? '' : `${formatCurrency(totals.donationCollected, totals.currency)} in gifts`}
            </span>
          </p>
        </div>
      </div>

      <Card title="Daily collections" description="Successful payments in this period.">
        <div className="h-80 px-2 py-4">
          {chart.length === 0 ? (
            <p className="grid h-full place-items-center text-sm text-stone-500">No successful payments in this period.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                <CartesianGrid stroke="#f0eeea" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#78716c' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#78716c' }} axisLine={false} tickLine={false} width={72} />
                <Tooltip
                  cursor={{ fill: '#f5f5f4' }}
                  formatter={(value) => formatCurrency(Number(value), totals.currency)}
                  contentStyle={{ borderRadius: 12, borderColor: '#e7e5e4', fontSize: 13 }}
                />
                <Bar dataKey="amount" fill="#065f46" radius={[8, 8, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <DataTable>
        <thead>
          <tr>
            <th>Purpose</th>
            <th>Status</th>
            <th>Count</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <EmptyRow colSpan={4} label="Loading report…" />
          ) : breakdown.length === 0 ? (
            <EmptyRow colSpan={4} label="No payments in this period." />
          ) : (
            breakdown.map((row) => (
              <tr key={`${row.purpose}-${row.status}`}>
                <td className="font-medium capitalize">{humanize(row.purpose)}</td>
                <td><Badge value={row.status} /></td>
                <td>{row.count}</td>
                <td>{formatCurrency(row.amount, totals.currency)}</td>
              </tr>
            ))
          )}
        </tbody>
      </DataTable>
    </div>
  );
}
