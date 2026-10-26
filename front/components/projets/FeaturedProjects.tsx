import { ShieldAlert, Cog, TrendingUp } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { Project, ProjectStatus } from '@/lib/projects';

const STATUS_CLASS: Record<ProjectStatus, string> = {
  'En Production': 'border-gold-dark/40 bg-gold-dark/10 text-gold',
  Pilote: 'border-pulse/40 bg-pulse/10 text-glow',
  'R&D': 'border-pulse/30 bg-pulse/5 text-secondary',
  Archivé: 'border-default bg-surface text-muted',
};

const icons = [
  { key: 'challenge' as const, icon: ShieldAlert },
  { key: 'approach' as const, icon: Cog },
  { key: 'value' as const, icon: TrendingUp },
];

function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${STATUS_CLASS[status]}`}>
      {status}
    </span>
  );
}

export default async function FeaturedProjects({ projects }: { projects: Project[] }) {
  const t = await getTranslations('featuredProjects');

  return (
    <div className="space-y-16">
      {projects.map((project, idx) => {
        const detail = project.detail;
        if (!detail) return null;

        return (
          <article key={project.slug} className="rounded-2xl border border-default bg-background">
            <div className="p-8 md:p-10 border-b border-default">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-flex px-2 py-1 rounded bg-border-strong text-xs font-medium text-glow">
                  {project.pole}
                </span>
                <StatusBadge status={project.status} />
              </div>
              <h3 className="text-2xl md:text-3xl font-heading font-bold text-primary mb-3">
                {idx + 1}. {project.title}
              </h3>
              <p className="text-secondary max-w-3xl leading-relaxed">{project.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3">
              {icons.map(({ key, icon: Icon }, colIdx) => (
                <div
                  key={key}
                  className={`p-8 md:p-10 ${
                    colIdx > 0 ? 'border-t border-default md:border-t-0 md:border-l' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-lg bg-border-strong flex items-center justify-center text-gold">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-heading font-bold text-primary">{t(key)}</p>
                      <p className="text-xs text-muted">{t(`${key}Desc`)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-secondary leading-relaxed">{detail[key]}</p>
                </div>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}