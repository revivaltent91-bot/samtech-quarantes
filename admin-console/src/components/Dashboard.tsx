import { useEffect, useState } from 'react';
import { ArrowRight, Building2, FolderKanban, Newspaper, Plus, Users } from 'lucide-react';
import { api } from '../api';
import type { ArticleRow, Pole, ProjectRow, User } from '../types';
import { Badge, Button, Card, PageHeader, Spinner, StatCard } from './ui';

function statusTone(status: string): 'gold' | 'danger' | 'neutral' | 'success' {
  const s = status.toLowerCase();
  if (s.includes('terminé') || s.includes('livré') || s.includes('en ligne') || s.includes('online')) return 'success';
  if (s.includes('brouillon') || s.includes('en cours') || s.includes('planned') || s.includes('draft')) return 'neutral';
  if (s.includes('suspendu') || s.includes('annulé') || s.includes('archiv')) return 'danger';
  return 'gold';
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(
      new Date(iso)
    );
  } catch {
    return iso;
  }
}

export default function Dashboard({
  isAdmin,
  onArticles,
  onProjects,
  onCreateArticle,
  onCreateProject,
}: {
  isAdmin: boolean;
  onArticles: () => void;
  onProjects: () => void;
  onCreateArticle: () => void;
  onCreateProject: () => void;
}) {
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [poles, setPoles] = useState<Pole[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchers: (() => Promise<unknown>)[] = [
      () => api.listArticles().catch(() => [] as ArticleRow[]),
      () => api.listProjects().catch(() => [] as ProjectRow[]),
      () => api.listPoles().catch(() => [] as Pole[]),
    ];
    if (isAdmin) {
      fetchers.push(() => api.listUsers().catch(() => [] as User[]));
    }

    Promise.all(fetchers.map((f) => f())).then(([arts, projs, pols, usrs]) => {
      setArticles(arts as ArticleRow[]);
      setProjects(projs as ProjectRow[]);
      setPoles(pols as Pole[]);
      if (usrs) setUsers(usrs as User[]);
      setLoading(false);
    });
  }, [isAdmin]);

  const featuredArticles = articles.filter((a) => a.featured).length;
  const featuredProjects = projects.filter((p) => p.featured).length;
  const recentArticles = [...articles]
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, 5);
  const recentProjects = [...projects]
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble des contenus édités sur la vitrine QUARANTES."
        actions={
          <>
            <Button onClick={onCreateArticle}>
              <Plus className="h-4 w-4" /> Nouvel article
            </Button>
            <Button variant="ghost" onClick={onCreateProject}>
              <Plus className="h-4 w-4" /> Nouveau projet
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-default bg-background py-14 text-muted">
          <Spinner /> Chargement des statistiques…
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Newspaper}
              label="Publications"
              value={articles.length}
              hint={`${featuredArticles} à la une`}
            />
            <StatCard
              icon={FolderKanban}
              label="Projets"
              value={projects.length}
              hint={`${featuredProjects} à la une`}
            />
            <StatCard icon={Building2} label="Pôles" value={poles.length} />
            {isAdmin && <StatCard icon={Users} label="Utilisateurs" value={users.length} />}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <div className="flex items-center justify-between border-b border-default px-5 py-4">
                <h2 className="font-semibold text-primary">Derniers articles</h2>
                <button
                  type="button"
                  onClick={onArticles}
                  className="inline-flex items-center gap-1 text-sm text-gold-dark hover:text-gold-light dark:text-gold dark:hover:text-gold-light"
                >
                  Tout voir <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <ul className="divide-y divide-default">
                {recentArticles.length === 0 && (
                  <li className="p-5 text-sm text-muted">Aucun article publié.</li>
                )}
                {recentArticles.map((a) => (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={onArticles}
                      className="flex w-full items-center justify-between gap-4 px-5 py-3 text-left transition-colors hover:bg-surface-muted/30"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-primary">{a.title}</p>
                        <p className="truncate text-xs text-muted">
                          {a.pole} · {formatDate(a.publishedAt)}
                        </p>
                      </div>
                      {a.featured && <Badge tone="gold">À la une</Badge>}
                    </button>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <div className="flex items-center justify-between border-b border-default px-5 py-4">
                <h2 className="font-semibold text-primary">Derniers projets</h2>
                <button
                  type="button"
                  onClick={onProjects}
                  className="inline-flex items-center gap-1 text-sm text-gold-dark hover:text-gold-light dark:text-gold dark:hover:text-gold-light"
                >
                  Tout voir <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <ul className="divide-y divide-default">
                {recentProjects.length === 0 && (
                  <li className="p-5 text-sm text-muted">Aucun projet référencé.</li>
                )}
                {recentProjects.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={onProjects}
                      className="flex w-full items-center justify-between gap-4 px-5 py-3 text-left transition-colors hover:bg-surface-muted/30"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-primary">{p.title}</p>
                        <p className="truncate text-xs text-muted">
                          {p.pole} · {p.stack.join(', ')}
                        </p>
                      </div>
                      <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}