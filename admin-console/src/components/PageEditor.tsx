import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card } from './ui';

export function RailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <h2 className="border-b border-default px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gold-dark dark:text-gold">
        {title}
      </h2>
      <div className="space-y-4 p-4">{children}</div>
    </Card>
  );
}

export default function PageEditor({
  title,
  backLabel = 'Retour',
  onBack,
  rail,
  children,
  actions,
}: {
  title: string;
  backLabel?: string;
  onBack: () => void;
  rail?: ReactNode;
  children: ReactNode;
  actions: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-2 inline-flex items-center gap-1.5 text-sm text-secondary transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> {backLabel}
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-primary">{title}</h1>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">{children}</div>
        {rail && <aside className="space-y-6 lg:sticky lg:top-20">{rail}</aside>}
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-default bg-background/95 px-4 py-4 backdrop-blur md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
        <div className="flex justify-end gap-3">{actions}</div>
      </div>
    </div>
  );
}