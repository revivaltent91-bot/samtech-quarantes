'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Project, ProjectPole } from '@/lib/projects';
import { PROJECT_POLES } from '@/lib/projects';
import ProjectCard from '@/components/projets/ProjectCard';

interface ProjectsClientProps {
  projects: Project[];
}

export default function ProjectsClient({ projects }: ProjectsClientProps) {
  const t = useTranslations('projects');
  const [activePole, setActivePole] = useState<ProjectPole | null>(null);

  const filtered = useMemo(
    () => (activePole ? projects.filter((p) => p.pole === activePole) : projects),
    [projects, activePole]
  );

  return (
    <div>
      <div
        className="flex flex-nowrap gap-2 mb-10 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="group"
        aria-label={t('projectsListAriaLabel')}
      >
        <button
          type="button"
          onClick={() => setActivePole(null)}
          aria-pressed={activePole === null}
          className={`shrink-0 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
            activePole === null
              ? 'border-gold bg-gold text-black'
              : 'border-default text-muted hover:border-gold-dark hover:text-primary'
          }`}
        >
          {t('allFilter')}
        </button>
        {PROJECT_POLES.map((pole) => (
          <button
            key={pole}
            type="button"
            onClick={() => setActivePole(pole)}
            aria-pressed={activePole === pole}
            className={`shrink-0 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
              activePole === pole
                ? 'border-gold bg-gold text-black'
                : 'border-default text-muted hover:border-gold-dark hover:text-primary'
            }`}
          >
            {pole}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-secondary py-12 text-center">{t('noProjects')}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="list">
          {filtered.map((project) => (
            <div key={project.slug} role="listitem">
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}