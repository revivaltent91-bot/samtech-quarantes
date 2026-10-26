'use client';

import { useMemo, useState } from 'react';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Article, Pole } from '@/lib/articles';
import { POLES, formatDate } from '@/lib/articles';

const PAGE_SIZE = 6;

interface InsightsClientProps {
  articles: Article[];
}

export default function InsightsClient({ articles }: InsightsClientProps) {
  const t = useTranslations('insights');
  const [activePole, setActivePole] = useState<Pole | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(
    () => (activePole ? articles.filter((a) => a.pole === activePole) : articles),
    [articles, activePole]
  );

  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  const handlePole = (pole: Pole | null) => {
    setActivePole(pole);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <div>
      <div
        className="flex flex-wrap gap-2 mb-10"
        role="group"
        aria-label={t('articlesListAriaLabel')}
      >
        <button
          type="button"
          onClick={() => handlePole(null)}
          aria-pressed={activePole === null}
          className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
            activePole === null
              ? 'border-gold bg-gold text-black'
              : 'border-default text-muted hover:border-gold-dark hover:text-primary'
          }`}
        >
          {t('allFilter')}
        </button>
        {POLES.map((pole) => (
          <button
            key={pole}
            type="button"
            onClick={() => handlePole(pole)}
            aria-pressed={activePole === pole}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
              activePole === pole
                ? 'border-gold bg-gold text-black'
                : 'border-default text-muted hover:border-gold-dark hover:text-primary'
            }`}
          >
            {pole}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-secondary py-12 text-center">{t('noArticles')}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="list">
          {visible.map((article) => (
            <Link
              key={article.slug}
              href={`/insights/${article.slug}`}
              role="listitem"
              className="group flex flex-col overflow-hidden rounded-xl bg-background border border-default hover:border-gold-dark transition-colors"
            >
              <div
                className="relative h-48 overflow-hidden"
                style={{ backgroundImage: `url('${article.heroImage}')` }}
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-cover bg-center opacity-40 duotone-gold transition-opacity duration-500 group-hover:opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <span className="inline-flex w-fit px-2 py-1 rounded bg-border-strong text-xs font-medium text-glow mb-4">
                  {article.pole}
                </span>
                <h3 className="text-lg font-heading font-bold mb-3 group-hover:text-gold transition-colors leading-snug">
                  {article.title}
                </h3>
                <p className="text-sm text-secondary leading-relaxed mb-5 line-clamp-3">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted mb-5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> {formatDate(article.publishedAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {article.readTime} min
                  </span>
                </div>
                <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-gold">
                  {t('readArticle')}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="px-6 py-3 rounded border border-default hover:bg-border-strong transition-colors text-sm font-medium text-primary"
          >
            {t('loadMore')}
          </button>
        </div>
      )}
    </div>
  );
}