import { FormEvent, useEffect, useState } from 'react';
import { api, ApiError } from '../api';
import { slugify } from '../types';
import type { Meta, Project, Pole } from '../types';
import PageEditor, { RailSection } from './PageEditor';
import { Button, Card, Checkbox, ErrorBanner, Field, Select, TextArea, TextInput } from './ui';

interface ProjectForm extends Omit<Project, 'pole'> {
  poleId: number;
}

function emptyProject(): ProjectForm {
  return {
    slug: '',
    title: '',
    poleId: 0,
    status: '',
    description: '',
    stack: [],
    confidential: false,
    url: null,
    featured: false,
    articleSlug: null,
    detail: { challenge: '', approach: '', value: '' },
  };
}

function convertToForm(project: Project): ProjectForm {
  return {
    slug: project.slug,
    title: project.title,
    poleId: project.poleId || 0,
    status: project.status,
    description: project.description,
    stack: project.stack,
    confidential: project.confidential,
    url: project.url,
    featured: project.featured,
    articleSlug: project.articleSlug || null,
    detail: project.detail || { challenge: '', approach: '', value: '' },
  };
}

export default function ProjectEditor({
  id,
  onBack,
  onSaved,
}: {
  id: number | null;
  onBack: () => void;
  onSaved?: () => void;
}) {
  const [form, setForm] = useState<ProjectForm>(emptyProject());
  const [poles, setPoles] = useState<Pole[]>([]);
  const [articles, setArticles] = useState<{ slug: string; title: string }[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(id !== null);
  const [stackText, setStackText] = useState('');
  const [hasDetail, setHasDetail] = useState(false);
  const [slugTouched, setSlugTouched] = useState(id !== null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.meta().then(setMeta).catch(() => {});
    api.getMyPoles().then(setPoles).catch(() => {});

    // Charger les articles pour le sélecteur
    api.listArticles().then((arts) => {
      setArticles(arts.map((a) => ({ slug: a.slug, title: a.title })));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (id !== null) {
      api
        .getProject(id)
        .then((p) => {
          setForm(convertToForm(p));
          setStackText(p.stack.join(', '));
          setHasDetail(p.detail !== null);
        })
        .catch((err: unknown) =>
          setError(err instanceof ApiError ? String(err.detail) : 'Impossible de charger')
        )
        .finally(() => setLoading(false));
    }
  }, [id]);

  const set = <K extends keyof ProjectForm>(key: K, value: ProjectForm[K]) =>
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'title' && !slugTouched) next.slug = slugify(value as string);
      return next;
    });

  const setDetail = (key: keyof NonNullable<Project['detail']>, value: string) =>
    setForm((f) => ({
      ...f,
      detail: {
        challenge: f.detail?.challenge ?? '',
        approach: f.detail?.approach ?? '',
        value: f.detail?.value ?? '',
        [key]: value,
      },
    }));

  async function save(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!slugTouched && !form.slug) form.slug = slugify(form.title);
    const stack = stackText.split(',').map((s) => s.trim()).filter(Boolean);
    try {
      const payload = {
        ...form,
        poleId: form.poleId,
        stack,
        detail: hasDetail ? form.detail : null,
      };
      if (id === null) {
        await api.createProject(payload as unknown as Project);
      } else {
        await api.updateProject(id, payload as unknown as Partial<Project>);
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
        title={id === null ? 'Nouveau projet' : 'Modifier le projet'}
        backLabel="Projets"
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
            <RailSection title="Métadonnées">
              <Field label="Pôle">
                <Select value={form.poleId} onChange={(e) => set('poleId', Number(e.target.value))} required>
                  <option value="">— choisir —</option>
                  {poles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Statut">
                <Select
                  value={form.status}
                  onChange={(e) => set('status', e.target.value)}
                  required
                >
                  <option value="">— choisir —</option>
                  {meta?.projectStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Slug">
                <TextInput
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set('slug', e.target.value);
                  }}
                  required
                  pattern="[a-z0-9-]+"
                />
              </Field>
              <Field label="Stack (séparés par des virgules)">
                <TextInput
                  value={stackText}
                  onChange={(e) => setStackText(e.target.value)}
                  placeholder="React, TypeScript, Next.js"
                />
              </Field>
            </RailSection>

            <RailSection title="Liens">
              <Field label="Article lié (optionnel)">
                <Select
                  value={form.articleSlug || ''}
                  onChange={(e) => set('articleSlug', e.target.value || null)}
                >
                  <option value="">— Aucun article lié —</option>
                  {articles.map((a) => (
                    <option key={a.slug} value={a.slug}>
                      {a.title}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="URL (optionnelle)">
                <TextInput
                  value={form.url || ''}
                  onChange={(e) => set('url', e.target.value || null)}
                  placeholder="https://…"
                />
              </Field>
            </RailSection>

            <RailSection title="Options">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-primary">
                <Checkbox
                  checked={form.confidential}
                  onChange={(e) => set('confidential', e.target.checked)}
                />
                Confidentiel
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-primary">
                <Checkbox
                  checked={form.featured}
                  onChange={(e) => set('featured', e.target.checked)}
                />
                Projet à la une
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-primary">
                <Checkbox
                  checked={hasDetail}
                  onChange={(e) => setHasDetail(e.target.checked)}
                />
                Détails (défi/approche/valeur)
              </label>
            </RailSection>
          </>
        }
      >
        <Card className="p-6">
          <Field label="Titre du projet">
            <TextInput
              className="text-lg font-semibold"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              required
              placeholder="Titre du projet…"
            />
          </Field>
          <div className="mt-4">
            <Field label="Description">
              <TextArea
                rows={4}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                required
              />
            </Field>
          </div>
        </Card>

        {hasDetail && (
          <Card className="p-6">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gold-dark dark:text-gold">
              Détails du projet
            </h2>
            <div className="space-y-4">
              <Field label="Défi">
                <TextArea
                  rows={3}
                  value={form.detail?.challenge || ''}
                  onChange={(e) => setDetail('challenge', e.target.value)}
                  required={hasDetail}
                />
              </Field>
              <Field label="Approche">
                <TextArea
                  rows={3}
                  value={form.detail?.approach || ''}
                  onChange={(e) => setDetail('approach', e.target.value)}
                  required={hasDetail}
                />
              </Field>
              <Field label="Valeur">
                <TextArea
                  rows={3}
                  value={form.detail?.value || ''}
                  onChange={(e) => setDetail('value', e.target.value)}
                  required={hasDetail}
                />
              </Field>
            </div>
          </Card>
        )}
      </PageEditor>

      {error && (
        <div className="mt-4">
          <ErrorBanner>{error}</ErrorBanner>
        </div>
      )}
    </form>
  );
}