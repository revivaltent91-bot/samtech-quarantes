import type { Article, ArticleRow, Meta, Project, ProjectRow, Pole, User, UserRole } from './types';

const BASE = '/api';
const JSON_HEADERS = { 'Content-Type': 'application/json' };


export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(status: number, detail: unknown) {
    super(typeof detail === 'string' ? detail : `Erreur ${status}`);
    this.status = status;
    this.detail = detail;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    ...init,
  });
  if (!res.ok) {
    let detail: unknown = res.statusText;
    try {
      detail = (await res.json()).detail ?? res.statusText;
    } catch {
      /* corps vide */
    }
    throw new ApiError(res.status, detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  // Authentification
  me: () => request<{
    id: number;
    username: string;
    displayName: string;
    role: UserRole;
    userRole: string;
    pole: { id: number; name: string };
  }>('/admin/me'),
  login: (username: string, password: string) =>
    request<{ ok: boolean; username: string; displayName: string; role: UserRole; poleId: number }>('/admin/login', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify({ username, password }),
    }),
  logout: () => request<{ ok: boolean }>('/admin/logout', { method: 'POST' }),
  getMyPoles: () => request<Pole[]>('/admin/me/poles'),
  getPoleAuthors: (poleId: number) => request<User[]>('/admin/poles/' + poleId + '/authors'),

  meta: () => request<Meta>('/meta'),

  // Gestion des pôles
  listPoles: () => request<Pole[]>('/admin/poles'),
  createPole: (pole: Omit<Pole, 'id'>) => request<Pole>('/admin/poles', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(pole)
  }),
  getPole: (id: number) => request<Pole>('/admin/poles/' + id),
  updatePole: (id: number, pole: Partial<Pole>) => request<Pole>('/admin/poles/' + id, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(pole)
  }),
  deletePole: (id: number) => request<void>('/admin/poles/' + id, { method: 'DELETE' }),

  // Gestion des utilisateurs
  listUsers: () => request<User[]>('/admin/users'),
  createUser: (user: Omit<User, 'id' | 'pole'> & { poleId: number; password: string }) =>
    request<User>('/admin/users', {
      method: 'POST',
      headers: JSON_HEADERS,
      body: JSON.stringify(user)
    }),
  getUser: (id: number) => request<User>('/admin/users/' + id),
  updateUser: (id: number, user: Partial<User>) => request<User>('/admin/users/' + id, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(user)
  }),
  deleteUser: (id: number) => request<void>('/admin/users/' + id, { method: 'DELETE' }),

  // Articles
  listArticles: () => request<ArticleRow[]>('/admin/articles'),
  getArticle: (id: number) => request<ArticleRow>(`/admin/articles/${id}`),
  createArticle: (a: Article) =>
    request<ArticleRow>('/admin/articles', { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(a) }),
  updateArticle: (id: number, patch: Partial<Article>) =>
    request<ArticleRow>(`/admin/articles/${id}`, { method: 'PUT', headers: JSON_HEADERS, body: JSON.stringify(patch) }),
  deleteArticle: (id: number) => request<void>(`/admin/articles/${id}`, { method: 'DELETE' }),

  // Projets
  listProjects: () => request<ProjectRow[]>('/admin/projects'),
  getProject: (id: number) => request<ProjectRow>(`/admin/projects/${id}`),
  createProject: (p: Project) =>
    request<ProjectRow>('/admin/projects', { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(p) }),
  updateProject: (id: number, patch: Partial<Project>) =>
    request<ProjectRow>(`/admin/projects/${id}`, { method: 'PUT', headers: JSON_HEADERS, body: JSON.stringify(patch) }),
  deleteProject: (id: number) => request<void>(`/admin/projects/${id}`, { method: 'DELETE' }),
};
