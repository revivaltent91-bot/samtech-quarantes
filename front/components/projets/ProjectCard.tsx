'use client';

import { CheckCircle2, FlaskConical, Cog, Archive, Lock, ExternalLink, FolderKanban, BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Project, ProjectStatus } from '@/lib/projects';

const STATUS_ICON: Record<ProjectStatus, typeof Cog> = {
  'En Production': CheckCircle2,
  Pilote: FlaskConical,
  'R&D': Cog,
  Archivé: Archive,
};

const STATUS_CLASS: Record<ProjectStatus, string> = {
  'En Production': 'border-gold-dark/40 bg-gold-dark/10 text-gold',
  Pilote: 'border-pulse/40 bg-pulse/10 text-glow',
  'R&D': 'border-pulse/30 bg-pulse/5 text-secondary',
  Archivé: 'border-default bg-surface text-muted',
};

export default function ProjectCard({ project }: { project: Project }) {
  const t = useTranslations('projectCard');
  const StatusIcon = STATUS_ICON[project.status];

  return (
    <div className="flex flex-col p-6 rounded-xl bg-background border border-default hover:border-gold-dark transition-colors">
      <div className="flex items-center justify-between gap-3 mb-4">
        <span className="inline-flex px-2 py-1 rounded bg-border-strong text-xs font-medium text-glow">
          {project.pole}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${STATUS_CLASS[project.status]}`}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {project.status}
        </span>
      </div>

      <h3 className="text-lg font-heading font-bold text-primary mb-3 leading-snug">
        {project.title}
      </h3>
      <p className="text-sm text-secondary leading-relaxed mb-5 line-clamp-3">{project.description}</p>

      {project.articleSlug && (
        <Link
          href={`/insights/${project.articleSlug}`}
          className="mb-4 inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors text-sm font-medium"
        >
          <BookOpen className="w-4 h-4" />
          {t('readFullArticle')}
        </Link>
      )}

      <div className="flex flex-wrap gap-2 mb-5" aria-label={t('stackAriaLabel')}>
        {project.stack.map((tech) => (
          <span key={tech} className="px-2 py-1 rounded bg-border-strong text-xs text-secondary">
            {tech}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-2 border-t border-default text-xs flex items-center gap-2">
        {project.confidential ? (
          <span className="inline-flex items-center gap-1.5 text-gold-dark font-medium">
            <Lock className="w-3.5 h-3.5" /> {t('confidential')}
          </span>
        ) : project.url ? (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-gold font-medium hover:text-gold-light transition-colors"
          >
            {t('publicResource')} <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-muted">
            <FolderKanban className="w-3.5 h-3.5" /> {t('internalResource')}
          </span>
        )}
      </div>
    </div>
  );
}