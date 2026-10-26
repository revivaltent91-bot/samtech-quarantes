import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

const inputClass =
  'w-full rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary placeholder:text-muted focus:border-gold-dark outline-none';

export function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block ${className ?? ''}`}>
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-secondary">
        {label}
      </span>
      {children}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ''}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} ${props.className ?? ''}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${inputClass} ${props.className ?? ''}`}>
      {props.children}
    </select>
  );
}

export function Checkbox(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      {...props}
      className={`h-4 w-4 accent-[--color-gold] ${props.className ?? ''}`}
    />
  );
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}) {
  const styles = {
    primary:
      'bg-gold text-black font-semibold hover:bg-gold-light',
    ghost: 'border border-default text-primary hover:border-gold-dark',
    danger: 'border border-red-900/60 text-red-300 hover:bg-red-950/40',
  }[variant];
  const sizes = { sm: 'px-2.5 py-1 text-xs', md: 'px-4 py-2 text-sm' }[size];
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg ${sizes} transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${props.className ?? ''}`}
    >
      {children}
    </button>
  );
}

export function IconButton({
  icon: Icon,
  label,
  tone = 'default',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: LucideIcon;
  label: string;
  tone?: 'default' | 'danger';
}) {
  const tones = {
    default: 'text-secondary hover:text-primary hover:bg-surface-muted',
    danger: 'text-secondary hover:text-red-400 hover:bg-red-950/40',
  }[tone];
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      {...props}
      className={`rounded-lg p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${tones} ${props.className ?? ''}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`rounded-xl border border-default bg-background ${className ?? ''}`}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-dark dark:bg-gold/10 dark:text-gold">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-muted">{label}</p>
        <p className="text-2xl font-bold tracking-tight text-primary">{value}</p>
        {hint && <p className="truncate text-xs text-muted">{hint}</p>}
      </div>
    </Card>
  );
}

export function Badge({
  tone = 'neutral',
  children,
}: {
  tone?: 'gold' | 'danger' | 'neutral' | 'success';
  children: ReactNode;
}) {
  const tones = {
    gold: 'bg-gold/15 text-gold-dark dark:bg-gold/10 dark:text-gold',
    danger: 'bg-red-950/40 text-red-300',
    success: 'bg-emerald-900/30 text-emerald-300',
    neutral: 'bg-surface-muted text-secondary',
  }[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${tones}`}
    >
      {children}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-border-strong border-t-gold-dark ${className ?? ''}`}
    />
  );
}

export function EmptyState({
  icon: Icon,
  title,
  hint,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-muted">
        <Icon className="h-6 w-6" />
      </div>
      <p className="font-medium text-primary">{title}</p>
      {hint && <p className="text-sm text-muted">{hint}</p>}
    </div>
  );
}

export function ErrorBanner({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">
      {children}
    </div>
  );
}