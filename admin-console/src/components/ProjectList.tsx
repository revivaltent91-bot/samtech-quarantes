import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api, ApiError } from '../api';
import type { ProjectRow } from '../types';
import DataTable, { FilterSelect } from './DataTable';
import { Badge, Button, ErrorBanner, IconButton, PageHeader } from './ui';

function statusTone(status: string): 'gold' | 'danger' | 'neutral' | 'success' {
  const s = status.toLowerCase();
  if (s.includes('terminé') || s.includes('livré') || s.includes('en ligne') || s.includes('online')) return 'success';
  if (s.includes('brouillon') || s.includes('en cours') || s.includes('planned') || s.includes('draft')) return 'neutral';
  if (s.includes('suspendu') || s.includes('annulé') || s.includes('archiv')) return 'danger';
  return 'gold';
}

export default function ProjectList({
  onEdit,
  onCreate,
}: {
  onEdit: (id: number) => void;
  onCreate: () => void;
}) {
  const [items, setItems] = useState<ProjectRow[] | null>(null);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [poleFilter, setPoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  async function load() {
    try {
      setLoadError('');
      setError('');
      setItems(await api.listProjects());
    } catch (err) {
      setLoadError(err instanceof ApiError ? String(err.detail) : 'Impossible de charger');
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function remove(p: ProjectRow) {
    if (!window.confirm(`Supprimer « ${p.title} » ?`)) return;
    try {
      setError('');
      await api.deleteProject(p.id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : 'Erreur');
    }
  }

  const poleOptions = useMemo(() => {
    const seen = new Set<string>();
    items?.forEach((p) => seen.add(p.pole));
    return [...seen].sort().map((p) => ({ value: p, label: p }));
  }, [items]);

  const statusOptions = useMemo(() => {
    const seen = new Set<string>();
    items?.forEach((p) => seen.add(p.status));
    return [...seen].sort().map((s) => ({ value: s, label: s }));
  }, [items]);

  const filtered = useMemo(() => {
    if (!items) return [];
    return items.filter(
      (p) => (!poleFilter || p.pole === poleFilter) && (!statusFilter || p.status === statusFilter)
    );
  }, [items, poleFilter, statusFilter]);

  return (
    <div>
      <PageHeader
        title="Projets"
        subtitle={items ? `${items.length} réalisation${items.length > 1 ? 's' : ''}` : 'Réalisations'}
        actions={
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4" /> Nouveau projet
          </Button>
        }
      />

      {error && <ErrorBanner>{error}</ErrorBanner>}

      <DataTable
        rows={filtered}
        getRowKey={(p) => p.id}
        loading={items === null}
        error={loadError || undefined}
        onRetry={load}
        searchText={(p) => `${p.title} ${p.description} ${p.stack.join(' ')} ${p.pole} ${p.status}`}
        searchPlaceholder="Rechercher un projet, une techno…"
        toolbar={
          <>
            <FilterSelect
              value={poleFilter}
              onChange={setPoleFilter}
              options={poleOptions}
              placeholder="Tous les pôles"
            />
            <FilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              placeholder="Tous les statuts"
            />
          </>
        }
        columns={[
          {
            key: 'title',
            header: 'Titre',
            render: (p) => (
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate font-medium text-primary">{p.title}</p>
                {p.confidential && <Badge tone="danger">Confidentiel</Badge>}
              </div>
            ),
          },
          { key: 'pole', header: 'Pôle', render: (p) => <span className="text-secondary">{p.pole}</span> },
          {
            key: 'status',
            header: 'Statut',
            render: (p) => <Badge tone={statusTone(p.status)}>{p.status}</Badge>,
          },
          {
            key: 'stack',
            header: 'Stack',
            render: (p) => (
              <div className="max-w-[240px] truncate text-xs text-muted">{p.stack.join(', ')}</div>
            ),
          },
          {
            key: 'featured',
            header: 'À la une',
            render: (p) => (p.featured ? <Badge tone="gold">À la une</Badge> : <span className="text-muted">—</span>),
          },
          {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (p) => (
              <div className="flex justify-end gap-1">
                <IconButton icon={Pencil} label="Éditer" onClick={() => onEdit(p.id)} />
                <IconButton icon={Trash2} label="Supprimer" tone="danger" onClick={() => void remove(p)} />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}