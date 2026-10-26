import { FormEvent, useEffect, useState } from 'react';
import { api, ApiError } from '../api';
import { Button, Card, Checkbox, ErrorBanner, Field, TextArea, TextInput } from './ui';
import PageEditor, { RailSection } from './PageEditor';
import type { Pole } from '../types';

export default function PoleEditor({
  id,
  onBack,
  onSaved,
}: {
  id: number | null;
  onBack: () => void;
  onSaved?: () => void;
}) {
  const [form, setForm] = useState<Omit<Pole, 'id'> & { id?: number }>({
    name: '',
    description: '',
    isActive: true,
  });
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      api.getPole(id)
        .then((pole) => setForm(pole))
        .catch((err: unknown) =>
          setError(err instanceof ApiError ? String(err.detail) : 'Impossible de charger le pôle')
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
        await api.updatePole(id, form);
      } else {
        await api.createPole(form as Omit<Pole, 'id'>);
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
        title={id ? 'Modifier le pôle' : 'Nouveau pôle'}
        backLabel="Pôles"
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
          <RailSection title="État">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-primary">
              <Checkbox
                checked={form.isActive}
                onChange={(e) => set('isActive', e.target.checked)}
              />
              Pôle actif
            </label>
            <p className="text-xs text-muted">
              Un pôle inactif reste visible en base mais ne propose plus de contenus sur la vitrine.
            </p>
          </RailSection>
        }
      >
        <Card className="p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gold-dark dark:text-gold">
            Informations du pôle
          </h2>
          <div className="space-y-4">
            <Field label="Nom">
              <TextInput
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                required
              />
            </Field>
            <Field label="Description">
              <TextArea
                rows={4}
                value={form.description || ''}
                onChange={(e) => set('description', e.target.value)}
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