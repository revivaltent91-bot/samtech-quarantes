import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api, ApiError } from '../api';
import type { Pole } from '../types';
import DataTable, { FilterSelect } from './DataTable';
import { Badge, Button, ErrorBanner, IconButton, PageHeader } from './ui';

export default function PoleList({
  onEdit,
  onCreate,
}: {
  onEdit: (id: number) => void;
  onCreate: () => void;
}) {
  const [poles, setPoles] = useState<Pole[] | null>(null);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  async function load() {
    try {
      setLoadError('');
      setError('');
      setPoles(await api.listPoles());
    } catch (err) {
      setLoadError(err instanceof ApiError ? String(err.detail) : 'Impossible de charger les pôles');
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce pôle ?')) return;
    try {
      setError('');
      await api.deletePole(id);
      await load();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail));
      } else {
        setError('Erreur lors de la suppression');
      }
    }
  }

  const filtered = poles
    ? poles.filter((p) => !activeFilter || (activeFilter === 'active' ? p.isActive : !p.isActive))
    : [];

  return (
    <div>
      <PageHeader
        title="Pôles"
        subtitle={poles ? `${poles.length} pôle${poles.length > 1 ? 's' : ''}` : 'Entités de la holding'}
        actions={
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4" /> Nouveau pôle
          </Button>
        }
      />

      {error && <ErrorBanner>{error}</ErrorBanner>}

      <DataTable
        rows={filtered}
        getRowKey={(p) => p.id}
        loading={poles === null}
        error={loadError || undefined}
        onRetry={load}
        searchText={(p) => `${p.name} ${p.description ?? ''}`}
        searchPlaceholder="Rechercher un pôle…"
        toolbar={
          <FilterSelect
            value={activeFilter}
            onChange={setActiveFilter}
            options={[
              { value: 'active', label: 'Actifs' },
              { value: 'inactive', label: 'Inactifs' },
            ]}
            placeholder="Tous les états"
          />
        }
        columns={[
          {
            key: 'name',
            header: 'Nom',
            render: (p) => (
              <div className="min-w-0 max-w-sm">
                <p className="truncate font-medium text-primary">{p.name}</p>
                {p.description && <p className="truncate text-xs text-muted">{p.description}</p>}
              </div>
            ),
          },
          {
            key: 'active',
            header: 'État',
            render: (p) => (p.isActive ? <Badge tone="success">Actif</Badge> : <Badge tone="danger">Inactif</Badge>),
          },
          {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (p) => (
              <div className="flex justify-end gap-1">
                <IconButton icon={Pencil} label="Modifier" onClick={() => onEdit(p.id)} />
                <IconButton icon={Trash2} label="Supprimer" tone="danger" onClick={() => void handleDelete(p.id)} />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}