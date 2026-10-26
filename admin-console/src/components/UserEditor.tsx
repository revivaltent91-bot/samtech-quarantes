import { FormEvent, useEffect, useState } from 'react';
import { api, ApiError } from '../api';
import { Button, Card, ErrorBanner, Field, Select, TextInput } from './ui';
import PageEditor, { RailSection } from './PageEditor';
import type { User, Pole } from '../types';

export default function UserEditor({
  id,
  onBack,
  onSaved,
}: {
  id: number | null;
  onBack: () => void;
  onSaved?: () => void;
}) {
  const [form, setForm] = useState<Omit<User, 'id' | 'pole'> & { id?: number; poleId: number; password?: string }>({
    username: '',
    displayName: '',
    role: 'publisher',
    userRole: '',
    poleId: 0,
    isActive: true,
    password: '',
  });
  const [poles, setPoles] = useState<Pole[]>([]);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');

  useEffect(() => {
    api.listPoles()
      .then(setPoles)
      .catch(() => {});

    if (id) {
      api.getUser(id)
        .then((user) => setForm({
          ...user,
          poleId: user.pole.id,
        }))
        .catch((err: unknown) =>
          setError(err instanceof ApiError ? String(err.detail) : 'Impossible de charger l\'utilisateur')
        )
        .finally(() => setLoading(false));
    }
  }, [id]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function save(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      if (id) {
        // Envoyer le mot de passe uniquement s'il a été saisi
        const { password, ...rest } = form;
        const updateData: Partial<User> & { password?: string } = rest;
        if (password) updateData.password = password;
        await api.updateUser(id, updateData);
      } else {
        // Pour la création, le password est requis
        if (!form.password) {
          setError('Le mot de passe est requis pour créer un utilisateur');
          return;
        }
        await api.createUser(form as Omit<User, 'id' | 'pole'> & { poleId: number; password: string });
      }
      onSaved?.();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail));
      } else {
        setError('Erreur lors de la sauvegarde');
      }
    }
  }

  if (loading) return <p className="text-muted">Chargement…</p>;

  return (
    <form onSubmit={save}>
      <PageEditor
        title={id ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        backLabel="Utilisateurs"
        onBack={onBack}
        actions={
          <>
            <Button type="button" variant="ghost" onClick={onBack}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </>
        }
        rail={
          <>
            <RailSection title="Rôle & accès">
              <Field label="Rôle">
                <Select
                  value={form.role}
                  onChange={(e) => set('role', e.target.value as 'admin' | 'publisher')}
                  required
                >
                  <option value="publisher">Publisher</option>
                  <option value="admin">Admin</option>
                </Select>
              </Field>
              <Field label="Rôle dans le pôle">
                <TextInput
                  value={form.userRole}
                  onChange={(e) => set('userRole', e.target.value)}
                  required
                />
              </Field>
              <Field label="Pôle">
                <Select
                  value={form.poleId}
                  onChange={(e) => set('poleId', Number(e.target.value))}
                  required
                >
                  <option value="">— choisir —</option>
                  {poles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Actif">
                <Select
                  value={form.isActive ? 'true' : 'false'}
                  onChange={(e) => set('isActive', e.target.value === 'true')}
                >
                  <option value="true">Actif</option>
                  <option value="false">Inactif</option>
                </Select>
              </Field>
            </RailSection>

            <RailSection title="Sécurité">
              <Field label={id ? 'Nouveau mot de passe' : 'Mot de passe'}>
                <TextInput
                  type="password"
                  value={form.password || ''}
                  onChange={(e) => set('password', e.target.value)}
                  required={!id}
                  placeholder={id ? 'Laisser vide pour conserver' : ''}
                />
              </Field>
            </RailSection>
          </>
        }
      >
        <Card className="p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gold-dark dark:text-gold">
            Informations de l'utilisateur
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Username (identifiant de connexion)">
              <TextInput
                value={form.username}
                onChange={(e) => set('username', e.target.value)}
                required
                disabled={!!id}
              />
            </Field>
            <Field label="Nom affiché">
              <TextInput
                value={form.displayName}
                onChange={(e) => set('displayName', e.target.value)}
                required
              />
            </Field>
          </div>
        </Card>
      </PageEditor>

      {error && (
        <div className="mt-4">
          <ErrorBanner>{error}</ErrorBanner>
        </div>
      )}
    </form>
  );
}