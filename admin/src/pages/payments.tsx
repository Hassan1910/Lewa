import { useEffect, useMemo, useState } from 'react';
import { PaymentReceipt } from '../components/payment-receipt';
import { Badge, Button, Card, DataTable, EmptyRow, Field, humanize, SelectField, StatCard } from '../components/ui';
import { formatCurrency, formatDate } from '../lib/format';
import {
  downloadCsv,
  emptyFilters,
  filterPayments,
  loadPayments,
  PAYMENT_PURPOSES,
  PAYMENT_STATUSES,
  paymentTotals,
  paymentsToCsv,
  type PaymentFilters,
  type PaymentRecord,
} from '../lib/payments';

export function PaymentsPage() {
  const [rows, setRows] = useState<PaymentRecord[]>([]);
  const [filters, setFilters] = useState<PaymentFilters>(emptyFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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

  const visible = useMemo(() => filterPayments(rows, filters), [rows, filters]);
  const totals = useMemo(() => paymentTotals(visible), [visible]);
  const selected = visible.find((row) => row.id === selectedId) ?? null;

  const exportCsv = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`lewa-payments-${stamp}.csv`, paymentsToCsv(visible));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Collected" value={formatCurrency(totals.collected, totals.currency)} icon="card" />
        <StatCard label="Pending" value={formatCurrency(totals.pendingAmount, totals.currency)} icon="chart" />
        <StatCard label="Failed" value={totals.failedCount} icon="message" />
        <StatCard label="Showing" value={totals.count} icon="list" />
      </div>

      <div className="grid gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-6">
        <Field
          className="xl:col-span-2"
          label="Search"
          placeholder="Name, email, reference, or service"
          value={filters.search}
          onChange={(event) => setFilters({ ...filters, search: event.target.value })}
        />
        <SelectField label="Status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
          <option value="">All statuses</option>
          {PAYMENT_STATUSES.map((status) => (
            <option key={status} value={status}>{humanize(status)}</option>
          ))}
        </SelectField>
        <SelectField label="Purpose" value={filters.purpose} onChange={(event) => setFilters({ ...filters, purpose: event.target.value })}>
          <option value="">All purposes</option>
          {PAYMENT_PURPOSES.map((purpose) => (
            <option key={purpose} value={purpose}>{humanize(purpose)}</option>
          ))}
        </SelectField>
        <Field label="From" type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} />
        <Field label="To" type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} />
      </div>

      <div className="flex justify-end">
        <Button type="button" tone="ghost" onClick={exportCsv} disabled={visible.length === 0}>
          Export CSV
        </Button>
      </div>

      {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
        <DataTable>
          <thead>
            <tr>
              <th>Payer</th>
              <th>Paid for</th>
              <th>Reference</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Method</th>
              <th>Paid</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <EmptyRow colSpan={7} label="Loading payments…" />
            ) : visible.length === 0 ? (
              <EmptyRow colSpan={7} label="No payments match these filters." />
            ) : (
              visible.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer"
                  tabIndex={0}
                  data-selected={selected?.id === row.id ? 'true' : undefined}
                  onClick={() => setSelectedId(row.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedId(row.id);
                    }
                  }}
                >
                  <td>
                    <p className="font-medium">{row.payerName}</p>
                    {row.payerEmail ? <p className="text-xs text-stone-500">{row.payerEmail}</p> : null}
                  </td>
                  <td>
                    <p>{row.description}</p>
                    {row.purpose ? <p className="text-xs capitalize text-stone-500">{humanize(row.purpose)}</p> : null}
                  </td>
                  <td className="font-medium">{row.reference}</td>
                  <td>{formatCurrency(row.amount, row.currency)}</td>
                  <td><Badge value={row.status} /></td>
                  <td className="capitalize">{row.method || '—'}</td>
                  <td>{formatDate(row.paidAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </DataTable>
        </div>

        <PaymentDetail payment={selected} onClose={() => setSelectedId(null)} />
      </div>
      {selected?.status === 'success' ? <PaymentReceipt payment={selected} /> : null}
    </div>
  );
}

function PaymentDetail({ payment, onClose }: { payment: PaymentRecord | null; onClose: () => void }) {
  if (!payment) {
    return (
      <Card title="Payment" description="Select a row to see who paid and what it was for." bodyClassName="p-5">
        <p className="text-sm leading-6 text-stone-500">Receipts can be printed once Paystack has verified the charge.</p>
      </Card>
    );
  }

  return (
    <Card
      title={payment.payerName}
      description={payment.reference}
      action={
        <Button type="button" tone="ghost" className="px-3 py-1.5" onClick={onClose}>
          Close
        </Button>
      }
      bodyClassName="space-y-4 p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-2xl font-semibold tracking-tight">{formatCurrency(payment.amount, payment.currency)}</p>
        <Badge value={payment.status} />
      </div>
      <dl className="space-y-3 text-sm">
        <Detail label="Email" value={payment.payerEmail || '—'} />
        <Detail label="Phone" value={payment.payerPhone || '—'} />
        <Detail label="Paid for" value={payment.description} />
        {payment.detail ? <Detail label="Visit" value={payment.detail} /> : null}
        <Detail label="Purpose" value={payment.purpose ? humanize(payment.purpose) : '—'} />
        <Detail label="Method" value={payment.method || '—'} />
        <Detail label="Provider" value={payment.provider} />
        <Detail label="Paid" value={formatDate(payment.paidAt)} />
        <Detail label="Created" value={formatDate(payment.createdAt)} />
        {payment.gatewayMessage ? <Detail label="Gateway" value={payment.gatewayMessage} /> : null}
      </dl>
      {payment.status === 'success' ? (
        <Button type="button" className="w-full" onClick={() => window.print()}>
          Print receipt
        </Button>
      ) : (
        <p className="text-sm leading-6 text-stone-500">Receipts are available after Paystack verifies the payment.</p>
      )}
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">{label}</dt>
      <dd className={`mt-0.5 break-words font-medium text-stone-800 ${label === 'Purpose' || label === 'Provider' ? 'capitalize' : ''}`}>{value}</dd>
    </div>
  );
}
