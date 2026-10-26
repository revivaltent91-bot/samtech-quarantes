import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api, ApiError } from '../api';
import type { ArticleRow } from '../types';
import DataTable, { FilterSelect } from './DataTable';
import { Badge, Button, ErrorBanner, IconButton, PageHeader } from './ui';

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(
      new Date(iso)
    );
  } catch {
    return iso;
  }
}

export default function ArticleList({
  onEdit,
  onCreate,
}: {
  onEdit: (id: number) => void;
  onCreate: () => void;
}) {
  const [items, setItems] = useState<ArticleRow[] | null>(null);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [poleFilter, setPoleFilter] = useState('');

  async function load() {
    try {
      setLoadError('');
      setError('');
      setItems(await api.listArticles());
    } catch (err) {
      setLoadError(err instanceof ApiError ? String(err.detail) : 'Impossible de charger');
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function remove(a: ArticleRow) {
    if (!window.confirm(`Supprimer « ${a.title} » ?`)) return;
    try {
      setError('');
      await api.deleteArticle(a.id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : 'Erreur');
    }
  }

  const poleOptions = useMemo(() => {
    const seen = new Set<string>();
    items?.forEach((a) => seen.add(a.pole));
    return [...seen].sort().map((p) => ({ value: p, label: p }));
  }, [items]);

  const filtered = useMemo(() => {
    if (!items) return [];
    if (!poleFilter) return items;
    return items.filter((a) => a.pole === poleFilter);
  }, [items, poleFilter]);

  return (
    <div>
      <PageHeader
        title="Articles"
        subtitle={items ? `${items.length} publication${items.length > 1 ? 's' : ''}` : 'Publications'}
        actions={
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4" /> Nouvel article
          </Button>
        }
      />

      {error && <ErrorBanner>{error}</ErrorBanner>}

      <DataTable
        rows={filtered}
        getRowKey={(a) => a.id}
        loading={items === null}
        error={loadError || undefined}
        onRetry={load}
        searchText={(a) => `${a.title} ${a.excerpt} ${a.author.name} ${a.pole}`}
        searchPlaceholder="Rechercher un article, un auteur…"
        toolbar={
          <FilterSelect
            value={poleFilter}
            onChange={setPoleFilter}
            options={poleOptions}
            placeholder="Tous les pôles"
          />
        }
        columns={[
          {
            key: 'title',
            header: 'Titre',
            render: (a) => (
              <div className="min-w-0 max-w-sm">
                <p className="truncate font-medium text-primary">{a.title}</p>
                {a.excerpt && <p className="truncate text-xs text-muted">{a.excerpt}</p>}
              </div>
            ),
          },
          { key: 'pole', header: 'Pôle', render: (a) => <span className="text-secondary">{a.pole}</span> },
          { key: 'author', header: 'Auteur', render: (a) => <span className="text-secondary">{a.author.name}</span> },
          {
            key: 'date',
            header: 'Publié le',
            render: (a) => <span className="whitespace-nowrap text-muted">{formatDate(a.publishedAt)}</span>,
          },
          {
            key: 'featured',
            header: 'À la une',
            render: (a) => (a.featured ? <Badge tone="gold">À la une</Badge> : <span className="text-muted">—</span>),
          },
          {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (a) => (
              <div className="flex justify-end gap-1">
                <IconButton icon={Pencil} label="Éditer" onClick={() => onEdit(a.id)} />
                <IconButton icon={Trash2} label="Supprimer" tone="danger" onClick={() => void remove(a)} />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}