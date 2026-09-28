import { createPortal } from 'react-dom';
import type { PaymentRecord } from '../lib/payments';
import { formatCurrency, formatDate } from '../lib/format';

export function PaymentReceipt({ payment }: { payment: PaymentRecord }) {
  const received = [payment.payerEmail, payment.payerPhone].filter(Boolean).join(' · ');
  return createPortal(
    <article className="print-receipt">
      <header className="border-b border-stone-300 pb-4">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-800">Lewa Wildlife Conservancy</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">Payment receipt</h1>
      </header>
      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-stone-500">Receipt number</dt>
          <dd className="mt-1 font-medium text-stone-900">{payment.reference}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-stone-500">Date paid</dt>
          <dd className="mt-1 font-medium text-stone-900">{formatDate(payment.paidAt || payment.createdAt)}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs font-bold uppercase tracking-wide text-stone-500">Received from</dt>
          <dd className="mt-1 font-medium text-stone-900">{payment.payerName}</dd>
          {received ? <dd className="text-stone-600">{received}</dd> : null}
        </div>
        <div className="col-span-2">
          <dt className="text-xs font-bold uppercase tracking-wide text-stone-500">Description</dt>
          <dd className="mt-1 font-medium text-stone-900">{payment.description}</dd>
          {payment.detail ? <dd className="text-stone-600">{payment.detail}</dd> : null}
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-stone-500">Amount</dt>
          <dd className="mt-1 text-xl font-semibold text-stone-900">{formatCurrency(payment.amount, payment.currency)}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-stone-500">Method</dt>
          <dd className="mt-1 font-medium capitalize text-stone-900">{payment.method || payment.provider}</dd>
        </div>
      </dl>
      <p className="mt-8 text-xs leading-5 text-stone-500">
        Paystack verified this charge. Amounts are in Kenyan Shillings unless another currency is shown.
      </p>
    </article>,
    document.body,
  );
}
