import type { ButtonHTMLAttributes, FormEvent, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import type { IconName } from './icons';
import { Icon } from './icons';

const fieldClass =
  'w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-medium text-stone-900 outline-none transition placeholder:font-normal placeholder:text-stone-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15';

const POSITIVE = new Set(['confirmed', 'completed', 'success', 'active', 'published', 'resolved', 'closed', 'yes']);
const WARNING = new Set(['pending_payment', 'payment_verification', 'open', 'in_progress', 'pending', 'processing']);
const DANGER = new Set(['cancelled', 'canceled', 'refunded', 'suspended', 'archived', 'failed', 'rejected']);

export type StatusTone = 'positive' | 'warning' | 'danger' | 'neutral';

export function statusTone(value: string): StatusTone {
  const key = value.toLowerCase();
  if (POSITIVE.has(key)) return 'positive';
  if (WARNING.has(key)) return 'warning';
  if (DANGER.has(key)) return 'danger';
  return 'neutral';
}

export function humanize(value: string) {
  return value.replaceAll('_', ' ');
}

export function PageHeader({ title, description, aside }: { title: string; description?: string; aside?: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold tracking-tight text-stone-900 md:text-xl">{title}</h1>
        {description ? <p className="line-clamp-2 text-sm leading-5 text-stone-500">{description}</p> : null}
      </div>
      {aside}
    </div>
  );
}

export function Card({
  title,
  description,
  action,
  children,
  className = '',
  bodyClassName = '',
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm ${className}`}>
      {title ? (
        <div className="flex items-center justify-between gap-3 border-b border-stone-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
            {description ? <p className="mt-0.5 text-xs text-stone-500">{description}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function StatCard({ label, value, icon }: { label: string; value: string | number; icon: IconName }) {
  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">{label}</p>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-800">
          <Icon name={icon} className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">{value}</p>
    </div>
  );
}

export function Badge({ value }: { value: string }) {
  return <span className={`status-pill status-${statusTone(value)}`}>{humanize(value)}</span>;
}

export function StatusSelect({
  value,
  options,
  onChange,
  disabled,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const choices = options.includes(value) || value === '' ? options : [value, ...options];
  return (
    <select
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`status-select status-${statusTone(value)}`}
    >
      {choices.map((option) => (
        <option key={option} value={option}>
          {humanize(option)}
        </option>
      ))}
    </select>
  );
}

export function Field({ label, className = '', ...props }: { label?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block text-sm font-medium text-stone-700 ${className}`}>
      {label ? <span>{label}</span> : null}
      <input {...props} className={`${fieldClass} ${label ? 'mt-1.5' : ''}`} />
    </label>
  );
}

export function TextArea({
  label,
  className = '',
  areaClassName = '',
  ...props
}: { label?: string; areaClassName?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className={`block text-sm font-medium text-stone-700 ${className}`}>
      {label ? <span>{label}</span> : null}
      <textarea {...props} className={`${fieldClass} ${areaClassName || 'min-h-24'} ${label ? 'mt-1.5' : ''}`} />
    </label>
  );
}

export function SelectField({
  label,
  className = '',
  compact = false,
  children,
  ...props
}: { label?: string; compact?: boolean } & SelectHTMLAttributes<HTMLSelectElement>) {
  const control = compact
    ? 'w-full rounded-xl border border-stone-200 bg-white px-2.5 py-1.5 text-sm font-medium text-stone-800 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15'
    : fieldClass;
  return (
    <label className={`block text-sm font-medium text-stone-700 ${className}`}>
      {label ? <span>{label}</span> : null}
      <select {...props} className={`${control} ${label ? 'mt-1.5' : ''}`}>
        {children}
      </select>
    </label>
  );
}

export function CheckField({ label, className = '', ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm font-medium text-stone-700 ${className}`}>
      <input {...props} type="checkbox" className="h-4 w-4 accent-emerald-800" />
      {label}
    </label>
  );
}

export function Button({
  tone = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'primary' | 'danger' | 'ghost' }) {
  const tones = {
    primary: 'bg-emerald-800 text-white shadow-sm hover:bg-emerald-900',
    danger: 'bg-transparent text-red-700 hover:bg-red-50',
    ghost: 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50',
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${tones[tone]} ${className}`}
    />
  );
}

export function FormCard({
  title,
  children,
  onSubmit,
  columns = 2,
}: {
  title?: string;
  children: ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  columns?: 1 | 2;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className={`mb-6 grid gap-3 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm ${columns === 2 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}
    >
      {title ? <h3 className="text-base font-semibold text-stone-900 sm:col-span-full">{title}</h3> : null}
      {children}
    </form>
  );
}

export function DataTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="data-table">{children}</table>
      </div>
    </div>
  );
}

export function EmptyRow({ colSpan, label = 'Nothing here yet.' }: { colSpan: number; label?: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-12 text-center text-sm text-stone-500">
        {label}
      </td>
    </tr>
  );
}

export function SectionHeading({ title }: { title: string }) {
  return <h2 className="mb-3 text-base font-semibold text-stone-900">{title}</h2>;
}
