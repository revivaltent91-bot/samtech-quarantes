import { useCallback, useEffect, useState } from 'react';
import {
  Building2,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Newspaper,
  Sun,
  Users,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { api } from './api';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ArticleList from './components/ArticleList';
import ArticleEditor from './components/ArticleEditor';
import ProjectList from './components/ProjectList';
import ProjectEditor from './components/ProjectEditor';
import PoleList from './components/PoleList';
import PoleEditor from './components/PoleEditor';
import UserList from './components/UserList';
import UserEditor from './components/UserEditor';

type Section = 'dashboard' | 'articles' | 'projects' | 'poles' | 'users';

type Route =
  | { name: Section }
  | { name: 'article-edit'; id: number | null }
  | { name: 'project-edit'; id: number | null }
  | { name: 'pole-edit'; id: number | null }
  | { name: 'user-edit'; id: number | null };

interface Me {
  id: number;
  username: string;
  displayName: string;
  role: 'admin' | 'publisher';
  userRole: string;
  pole: { id: number; name: string };
}

const NAV: { section: Section; label: string; icon: LucideIcon }[] = [
  { section: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { section: 'articles', label: 'Articles', icon: Newspaper },
  { section: 'projects', label: 'Projets', icon: FolderKanban },
  { section: 'poles', label: 'Pôles', icon: Building2 },
  { section: 'users', label: 'Utilisateurs', icon: Users },
];

function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || '?'
  );
}

export default function App() {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
  const [route, setRoute] = useState<Route>({ name: 'dashboard' });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let t: string | null = null;
    try {
      t = localStorage.getItem('quarantes-theme');
    } catch {
      /* ignore */
    }
    setTheme(
      t === 'dark' || t === 'light'
        ? t
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
    );
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('quarantes-theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    api
      .me()
      .then((m) => {
        setMe(m);
        setAuthed(true);
      })
      .catch(() => setAuthed(false))
      .finally(() => setChecking(false));
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setAuthed(false);
    setRoute({ name: 'dashboard' });
    setMe(null);
  }, []);

  const go = useCallback((section: Section) => {
    setRoute({ name: section });
    setSidebarOpen(false);
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-muted">
        <span
          aria-hidden
          className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-border-strong border-t-gold-dark"
        />
        Chargement…
      </div>
    );
  }

  if (!authed) {
    return <Login onAuthed={() => setAuthed(true)} />;
  }

  const current = route.name === 'article-edit'
    ? 'articles'
    : route.name === 'project-edit'
      ? 'projects'
      : route.name === 'pole-edit'
        ? 'poles'
        : route.name === 'user-edit'
          ? 'users'
          : route.name;

  const sidebar = (
    <aside className="flex h-full w-64 flex-col border-r border-default bg-background">
      <div className="flex h-16 items-center justify-between border-b border-default px-6">
        <span className="text-lg font-bold tracking-tight">
          QUARANTES<span className="text-gold">.</span>
        </span>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Fermer le menu"
          className="rounded-lg p-1 text-muted hover:text-primary lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV.map(({ section, label, icon: Icon }) => {
          const active = current === section;
          return (
            <button
              key={section}
              type="button"
              onClick={() => go(section)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-gold text-black'
                  : 'text-muted hover:bg-surface-muted hover:text-primary'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </nav>

      {me && (
        <div className="border-t border-default px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-sm font-semibold text-gold-dark dark:bg-gold/10 dark:text-gold">
              {initials(me.displayName)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-primary">{me.displayName}</p>
              <p className="truncate text-xs text-muted">
                {me.role === 'admin' ? 'Administrateur' : me.pole.name}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen">
        {/* Sidebar desktop */}
        <div className="sticky top-0 hidden h-screen shrink-0 lg:block">{sidebar}</div>

        {/* Sidebar mobile (overlay) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="absolute inset-y-0 left-0">{sidebar}</div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-default">
            <div className="flex h-16 items-center justify-between gap-4 border-default bg-background/90 px-4 backdrop-blur md:px-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Ouvrir le menu"
                  className="rounded-lg border border-default p-1.5 text-primary hover:border-gold-dark lg:hidden"
                >
                  <Menu className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium text-muted">
                  <span className="hidden sm:inline">Console </span>QUARANTES
                </span>
              </div>

              <div className="flex items-center gap-2">
                {me && me.role === 'admin' && (
                  <span className="hidden rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-secondary md:inline">
                    Admin
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                  aria-label={theme === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre'}
                  title={theme === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre'}
                  className="rounded-lg border border-default p-2 text-primary hover:border-gold-dark"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-default px-3 py-2 text-sm text-primary hover:border-gold-dark hover:text-primary"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 md:px-6 lg:px-8">
            {route.name === 'dashboard' && (
              <Dashboard
                isAdmin={me?.role === 'admin'}
                onArticles={() => go('articles')}
                onProjects={() => go('projects')}
                onCreateArticle={() => setRoute({ name: 'article-edit', id: null })}
                onCreateProject={() => setRoute({ name: 'project-edit', id: null })}
              />
            )}
            {route.name === 'articles' && (
              <ArticleList
                onEdit={(id) => setRoute({ name: 'article-edit', id })}
                onCreate={() => setRoute({ name: 'article-edit', id: null })}
              />
            )}
            {route.name === 'article-edit' && (
              <ArticleEditor
                id={route.id}
                onBack={() => setRoute({ name: 'articles' })}
                onSaved={() => setRoute({ name: 'articles' })}
              />
            )}
            {route.name === 'projects' && (
              <ProjectList
                onEdit={(id) => setRoute({ name: 'project-edit', id })}
                onCreate={() => setRoute({ name: 'project-edit', id: null })}
              />
            )}
            {route.name === 'project-edit' && (
              <ProjectEditor
                id={route.id}
                onBack={() => setRoute({ name: 'projects' })}
                onSaved={() => setRoute({ name: 'projects' })}
              />
            )}
            {route.name === 'poles' && (
              <PoleList
                onEdit={(id) => setRoute({ name: 'pole-edit', id })}
                onCreate={() => setRoute({ name: 'pole-edit', id: null })}
              />
            )}
            {route.name === 'pole-edit' && (
              <PoleEditor
                id={route.id}
                onBack={() => setRoute({ name: 'poles' })}
                onSaved={() => setRoute({ name: 'poles' })}
              />
            )}
            {route.name === 'users' && (
              <UserList
                onEdit={(id) => setRoute({ name: 'user-edit', id })}
                onCreate={() => setRoute({ name: 'user-edit', id: null })}
              />
            )}
            {route.name === 'user-edit' && (
              <UserEditor
                id={route.id}
                onBack={() => setRoute({ name: 'users' })}
                onSaved={() => setRoute({ name: 'users' })}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}