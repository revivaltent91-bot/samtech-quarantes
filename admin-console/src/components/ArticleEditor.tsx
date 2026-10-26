import { FormEvent, useEffect, useState } from 'react';
import { api, ApiError } from '../api';
import { blankBlock, slugify } from '../types';
import type { Article, ArticleBlock, Pole, User } from '../types';
import BlockEditor from './BlockEditor';
import PageEditor, { RailSection } from './PageEditor';
import { Button, Card, Checkbox, ErrorBanner, Field, Select, TextArea, TextInput } from './ui';

interface ArticleForm extends Omit<Article, 'author' | 'pole'> {
  authorId: number;
  poleId: number;
}

function emptyArticle(): ArticleForm {
  return {
    slug: '',
    title: '',
    poleId: 0,
    excerpt: '',
    heroImage: '',
    publishedAt: new Date().toISOString().slice(0, 10),
    readTime: 5,
    authorId: 0,
    featured: false,
    blocks: [{ type: 'paragraph', text: '' } as ArticleBlock],
  };
}

function convertToForm(article: Article): ArticleForm {
  return {
    slug: article.slug,
    title: article.title,
    poleId: article.poleId || 0,
    excerpt: article.excerpt,
    heroImage: article.heroImage,
    publishedAt: article.publishedAt,
    readTime: article.readTime,
    authorId: article.authorId || 0,
    featured: article.featured,
    blocks: article.blocks,
  };
}

export default function ArticleEditor({
  id,
  onBack,
  onSaved,
}: {
  id: number | null;
  onBack: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ArticleForm>(emptyArticle());
  const [poles, setPoles] = useState<Pole[]>([]);
  const [authors, setAuthors] = useState<User[]>([]);
  const [loading, setLoading] = useState(id !== null);
  const [slugTouched, setSlugTouched] = useState(id !== null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getMyPoles()
      .then(setPoles)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (form.poleId) {
      api.getPoleAuthors(form.poleId).then(setAuthors).catch(() => {});
    } else {
      setAuthors([]);
    }
  }, [form.poleId]);

  useEffect(() => {
    if (id !== null) {
      api
        .getArticle(id)
        .then((article) => setForm(convertToForm(article)))
        .catch((err: unknown) =>
          setError(err instanceof ApiError ? String(err.detail) : 'Impossible de charger')
        )
        .finally(() => setLoading(false));
    }
  }, [id]);

  const set = <K extends keyof ArticleForm>(key: K, value: ArticleForm[K]) =>
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'title' && !slugTouched) next.slug = slugify(value as string);
      return next;
    });

  async function save(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!slugTouched && !form.slug) form.slug = slugify(form.title);
    try {
      if (id === null) {
        await api.createArticle({
          ...form,
          poleId: form.poleId,
          authorId: form.authorId,
        } as unknown as Article);
      } else {
        await api.updateArticle(id, {
          ...form,
          poleId: form.poleId,
          authorId: form.authorId,
        } as unknown as Partial<Article>);
      }
      onSaved();
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
        title={id === null ? 'Nouvel article' : 'Modifier l’article'}
        backLabel="Articles"
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
              <Field label="Auteur">
                <Select
                  value={form.authorId}
                  onChange={(e) => set('authorId', Number(e.target.value))}
                  required
                  disabled={!form.poleId}
                >
                  <option value="">— choisir —</option>
                  {authors.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.displayName} ({a.userRole})
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
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date">
                  <TextInput
                    type="date"
                    value={form.publishedAt}
                    onChange={(e) => set('publishedAt', e.target.value)}
                    required
                  />
                </Field>
                <Field label="Lecture (min)">
                  <TextInput
                    type="number"
                    min={1}
                    value={form.readTime}
                    onChange={(e) => set('readTime', Number(e.target.value))}
                    required
                  />
                </Field>
              </div>
            </RailSection>

            <RailSection title="Mise en avant">
              <Field label="Image à la une (URL)">
                <TextInput
                  value={form.heroImage}
                  onChange={(e) => set('heroImage', e.target.value)}
                  required
                  placeholder="https://images.unsplash.com/…"
                />
              </Field>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-primary">
                <Checkbox
                  checked={form.featured}
                  onChange={(e) => set('featured', e.target.checked)}
                />
                Article à la une
              </label>
              {form.heroImage && (
                <div className="overflow-hidden rounded-lg border border-default">
                  <img
                    src={form.heroImage}
                    alt=""
                    className="h-24 w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </RailSection>
          </>
        }
      >
        <Card className="p-6">
          <Field label="Titre de l’article">
            <TextInput
              className="text-lg font-semibold"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              required
              placeholder="Titre de l’article…"
            />
          </Field>
          <div className="mt-4">
            <Field label="Extrait">
              <TextArea
                rows={3}
                value={form.excerpt}
                onChange={(e) => set('excerpt', e.target.value)}
                required
              />
            </Field>
          </div>
        </Card>

        <Card className="p-6">
          <BlockEditor
            blocks={form.blocks}
            onChange={(blocks) => setForm((f) => ({ ...f, blocks }))}
          />
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