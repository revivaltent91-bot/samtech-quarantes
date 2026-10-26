import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, UserX } from 'lucide-react';
import { api, ApiError } from '../api';
import type { User } from '../types';
import DataTable, { FilterSelect } from './DataTable';
import { Badge, Button, ErrorBanner, IconButton, PageHeader } from './ui';

export default function UserList({
  onEdit,
  onCreate,
}: {
  onEdit: (id: number) => void;
  onCreate: () => void;
}) {
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  async function load() {
    try {
      setLoadError('');
      setError('');
      setUsers(await api.listUsers());
    } catch (err) {
      setLoadError(err instanceof ApiError ? String(err.detail) : 'Impossible de charger les utilisateurs');
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm('Êtes-vous sûr de vouloir désactiver cet utilisateur ?')) return;
    try {
      setError('');
      await api.deleteUser(id);
      await load();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail));
      } else {
        setError('Erreur lors de la désactivation');
      }
    }
  }

  const roleOptions = useMemo(
    () => [
      { value: 'admin', label: 'Admin' },
      { value: 'publisher', label: 'Publisher' },
    ],
    []
  );

  const filtered = users
    ? users.filter(
        (u) =>
          (!roleFilter || u.role === roleFilter) &&
          (!activeFilter || (activeFilter === 'active' ? u.isActive : !u.isActive))
      )
    : [];

  return (
    <div>
      <PageHeader
        title="Utilisateurs"
        subtitle={users ? `${users.length} compte${users.length > 1 ? 's' : ''}` : 'Comptes de la console'}
        actions={
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4" /> Nouvel utilisateur
          </Button>
        }
      />

      {error && <ErrorBanner>{error}</ErrorBanner>}

      <DataTable
        rows={filtered}
        getRowKey={(u) => u.id}
        loading={users === null}
        error={loadError || undefined}
        onRetry={load}
        searchText={(u) => `${u.username} ${u.displayName} ${u.pole.name} ${u.userRole}`}
        searchPlaceholder="Rechercher un utilisateur…"
        toolbar={
          <>
            <FilterSelect value={roleFilter} onChange={setRoleFilter} options={roleOptions} placeholder="Tous les rôles" />
            <FilterSelect
              value={activeFilter}
              onChange={setActiveFilter}
              options={[
                { value: 'active', label: 'Actifs' },
                { value: 'inactive', label: 'Inactifs' },
              ]}
              placeholder="Tous les états"
            />
          </>
        }
        columns={[
          {
            key: 'name',
            header: 'Utilisateur',
            render: (u) => (
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xs font-semibold text-gold-dark dark:bg-gold/10 dark:text-gold">
                  {u.displayName
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((w) => w[0]?.toUpperCase() ?? '')
                    .join('') || '?'}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-primary">{u.displayName}</p>
                  <p className="truncate text-xs text-muted">@{u.username}</p>
                </div>
              </div>
            ),
          },
          {
            key: 'role',
            header: 'Rôle',
            render: (u) => (
              <Badge tone={u.role === 'admin' ? 'gold' : 'neutral'}>
                {u.role === 'admin' ? 'Admin' : 'Publisher'}
              </Badge>
            ),
          },
          { key: 'userRole', header: 'Rôle dans le pôle', render: (u) => <span className="text-secondary">{u.userRole}</span> },
          { key: 'pole', header: 'Pôle', render: (u) => <span className="text-secondary">{u.pole.name}</span> },
          {
            key: 'active',
            header: 'Actif',
            render: (u) => (u.isActive ? <Badge tone="success">Actif</Badge> : <Badge tone="danger">Inactif</Badge>),
          },
          {
            key: 'actions',
            header: '',
            className: 'text-right',
            render: (u) => (
              <div className="flex justify-end gap-1">
                <IconButton icon={Pencil} label="Modifier" onClick={() => onEdit(u.id)} />
                {u.isActive && (
                  <IconButton
                    icon={UserX}
                    label="Désactiver"
                    tone="danger"
                    onClick={() => void handleDelete(u.id)}
                  />
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}