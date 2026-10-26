export type ProjectPole = 'QUARANTES' | 'KOF Corporation' | 'KARABA' | 'TÉPÉ';

export const PROJECT_POLES: ProjectPole[] = ['QUARANTES', 'KOF Corporation', 'KARABA', 'TÉPÉ'];

export type ProjectStatus = 'En Production' | 'Pilote' | 'R&D' | 'Archivé';

export const PROJECT_STATUSES: ProjectStatus[] = [
  'En Production',
  'Pilote',
  'R&D',
  'Archivé',
];

export interface ProjectDetail {
  challenge: string;
  approach: string;
  value: string;
}

export interface Project {
  slug: string;
  title: string;
  pole: ProjectPole;
  status: ProjectStatus;
  description: string;
  stack: string[];
  confidential?: boolean;
  url?: string;
  featured?: boolean;
  detail?: ProjectDetail;
  articleSlug?: string | null;
}

export function getProject(slug: string, source: Project[] = FALLBACK_PROJECTS): Project | undefined {
  return source.find((p) => p.slug === slug);
}

export function getActiveProjects(source: Project[]): number {
  return source.filter((p) => p.status === 'En Production').length;
}

export function getFeaturedProjects(source: Project[]): Project[] {
  return source.filter((p) => p.featured && p.detail);
}

/**
 * Jeu de données de secours utilisé si l'API n'est pas joignable.
 * La source de vérité est la base de données (endpoints /api/projects).
 */
export const FALLBACK_PROJECTS: Project[] = [
  {
    slug: 'karaba-os-reseau-distribution',
    title: 'KARABA OS — réseau de distribution de proximité',
    pole: 'KARABA',
    status: 'En Production',
    featured: true,
    description:
      'Système d\'exploitation logistique connectant commerçants, transporteurs et clients via la messagerie, avec orchestration par agents IA.',
    stack: ['Agents IA', 'WhatsApp API', 'Mobile money', 'FastAPI'],
    url: 'https://karaba.dev',
    detail: {
      challenge:
        'Une chaîne de distribution fragmentée, sans visibilité sur les stocks ni les tournées, et une main-d\'œuvre habituée à la messagerie plutôt qu\'aux applications métier.',
      approach:
        'Intégration d\'agents IA dans WhatsApp pour saisir commandes et affecter les tournées en langage naturel, avec file d\'intention hors-ligne et réconciliation mobile money en fin de journée.',
      value:
        'Distribution opérationnelle 24/7, temps de saisie divisé par quatre et visibilité temps réel du dernier kilomètre sur l\'ensemble de la zone pilote.',
    },
  },
];