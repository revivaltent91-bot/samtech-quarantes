'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

const NetworkMap = dynamic(() => import('@/components/NetworkMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] md:h-[600px] rounded-2xl bg-surface border border-default animate-pulse" />
  ),
});

export default function GlobalReach() {
  const t = useTranslations('reach');

  return (
    <section
      className="py-24 bg-background border-t border-default relative"
      aria-labelledby="globalreach-heading"
    >
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2
              id="globalreach-heading"
              className="text-3xl md:text-5xl font-heading font-bold mb-4"
            >
              {t('heading')} <span className="text-gradient-gold">{t('headingGold')}</span>
            </h2>
            <p className="text-secondary max-w-2xl text-lg">{t('sub')}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <NetworkMap />
      </div>
    </section>
  );
}