export const BLOCK_TYPES = [
  'paragraph',
  'heading',
  'list',
  'quote',
  'table',
  'code',
  'image',
  'cta',
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export type ArticleBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'quote'; text: string; author?: string }
  | { type: 'table'; caption?: string; headers: string[]; rows: string[][] }
  | { type: 'code'; language?: string; code: string }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'cta'; text: string; href: string; label: string };

export interface Author {
  name: string;
  role: string;
  pole: string;
}

export interface AuthorOut {
  name: string;
  role: string;
  pole: string;
}

// Nouveaux types pour Pole
export interface Pole {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
}

// Nouveaux types pour User
export type UserRole = 'admin' | 'publisher';

export interface User {
  id: number;
  username: string;
  displayName: string;
  role: UserRole;
  userRole: string;
  pole: Pole;
  isActive: boolean;
}

export interface Article {
  slug: string;
  title: string;
  pole: string;
  excerpt: string;
  heroImage: string;
  publishedAt: string;
  readTime: number;
  author: AuthorOut;
  featured: boolean;
  blocks: ArticleBlock[];
  // Nouveaux champs pour compatibilité avec le backend
  poleId?: number;
  authorId?: number;
  createdById?: number;
}

export interface ArticleRow extends Article {
  id: number;
  createdAt: string;
  updatedAt: string;
  // Champs admin
  authorId?: number;
  createdById?: number;
  poleId?: number;
}

export interface ProjectDetail {
  challenge: string;
  approach: string;
  value: string;
}

export interface Project {
  slug: string;
  title: string;
  pole: string;
  status: string;
  description: string;
  stack: string[];
  confidential: boolean;
  url: string | null;
  featured: boolean;
  detail: ProjectDetail | null;
  // Nouveau champ pour le lien article-projet
  articleSlug?: string | null;
  // Nouveaux champs pour compatibilité avec le backend
  poleId?: number;
  createdById?: number;
}

export interface ProjectRow extends Project {
  id: number;
  createdAt: string;
  updatedAt: string;
  // Champs admin
  createdById?: number;
  poleId?: number;
}

export interface Meta {
  articlePoles: string[];
  projectPoles: string[];
  projectStatuses: string[];
}

export function blankBlock(type: BlockType): ArticleBlock {
  switch (type) {
    case 'paragraph':
      return { type: 'paragraph', text: '' };
    case 'heading':
      return { type: 'heading', level: 2, text: '' };
    case 'list':
      return { type: 'list', items: [''], ordered: false };
    case 'quote':
      return { type: 'quote', text: '', author: '' };
    case 'table':
      return { type: 'table', caption: '', headers: [''], rows: [['']] };
    case 'code':
      return { type: 'code', language: '', code: '' };
    case 'image':
      return { type: 'image', src: '', alt: '', caption: '' };
    case 'cta':
      return { type: 'cta', text: '', href: '', label: '' };
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}