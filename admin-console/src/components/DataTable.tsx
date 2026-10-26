import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Inbox, RotateCw, Search, X } from 'lucide-react';
import { Button, EmptyState, Spinner } from './ui';

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render?: (row: T) => ReactNode;
}

export default function DataTable<T>({
  rows,
  getRowKey,
  columns,
  loading = false,
  error,
  onRetry,
  searchText,
  searchPlaceholder = 'Rechercher…',
  toolbar,
  pageSize = 8,
  emptyTitle = 'Aucun élément',
}: {
  rows: T[];
  getRowKey: (row: T) => string | number;
  columns: Column<T>[];
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  searchText?: (row: T) => string;
  searchPlaceholder?: string;
  toolbar?: ReactNode;
  pageSize?: number;
  emptyTitle?: string;
}) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !searchText) return rows;
    return rows.filter((row) => searchText(row).toLowerCase().includes(q));
  }, [rows, query, searchText]);

  useEffect(() => {
    setPage(1);
  }, [query, rows.length, pageSize]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-default bg-background py-14 text-muted">
        <Spinner /> Chargement…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-default bg-background py-14 text-center">
        <p className="text-sm text-red-300">{error}</p>
        {onRetry && (
          <Button variant="ghost" onClick={onRetry}>
            <RotateCw className="h-4 w-4" /> Réessayer
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {(searchText || toolbar) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {searchText && (
            <div className="relative min-w-[220px] flex-1 max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-default bg-surface py-2 pl-9 pr-9 text-sm text-primary placeholder:text-muted focus:border-gold-dark outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Effacer la recherche"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted hover:text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
          {toolbar && <div className="flex flex-wrap items-center gap-2">{toolbar}</div>}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-default bg-background">
          <EmptyState icon={Inbox} title={emptyTitle} hint="Essayez de modifier votre recherche ou vos filtres." />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-default bg-background">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-default bg-surface-muted/60 text-xs uppercase tracking-wider text-muted">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className={`px-4 py-3 font-medium ${col.className ?? ''}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-default">
              {pageRows.map((row) => (
                <tr key={getRowKey(row)} className="transition-colors hover:bg-surface-muted/30">
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 align-middle ${col.className ?? ''}`}>
                      {col.render ? col.render(row) : <span className="text-primary">{(row as Record<string, unknown>)[col.key]?.toString() ?? ''}</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="flex items-center justify-between gap-3 text-sm text-muted">
          <span>
            {filtered.length} résultat{filtered.length > 1 ? 's' : ''} — page {safePage}/{pageCount}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              aria-label="Page précédente"
              className="rounded-lg border border-default p-1.5 text-primary hover:border-gold-dark disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={safePage >= pageCount}
              aria-label="Page suivante"
              className="rounded-lg border border-default p-1.5 text-primary hover:border-gold-dark disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function FilterSelect({
  value,
  onChange,
  options,
  placeholder = 'Tous',
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-default bg-surface px-3 py-2 text-sm text-primary focus:border-gold-dark outline-none"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}