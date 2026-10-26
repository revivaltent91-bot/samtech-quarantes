import type { Article } from '@/lib/articles';
import type { Project } from '@/lib/projects';

export const API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

const REVALIDATE = 300;

// Côté serveur (SSG/ISR) on appelle l'API directement ; côté navigateur on
// passe par le rewrite same-origin `/api/*` de Next (cf. next.config.ts),
// ce qui évite d'exposer l'API et tout problème de CORS.
function apiUrl(path: string): string {
  return typeof window === 'undefined' ? `${API_URL}${path}` : path;
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(apiUrl(path), {
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) {
    throw new Error(`API ${path} → ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function getArticles(): Promise<Article[]> {
  return fetchJson<Article[]>('/api/articles');
}

export async function getArticle(slug: string): Promise<Article | null> {
  try {
    return await fetchJson<Article>(`/api/articles/${encodeURIComponent(slug)}`);
  } catch {
    return null;
  }
}

export async function getProjects(): Promise<Project[]> {
  return fetchJson<Project[]>('/api/projects');
}