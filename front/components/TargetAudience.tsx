'use client';

import { motion } from 'motion/react';
import { Globe, Cpu, Network, Briefcase, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { trackEvent } from '@/lib/analytics';

const icons = [<Globe className="w-5 h-5" />, <Cpu className="w-5 h-5" />, <Network className="w-5 h-5" />, <Briefcase className="w-5 h-5" />];

type AudienceItem = {
  title: string;
  desc: string;
  points: string[];
  cta: string;
  ariaLabel: string;
};

export default function TargetAudience() {
  const t = useTranslations('audience');
  const targets = t.raw('items') as AudienceItem[];

  return (
    <section
      id="pour-qui"
      className="py-24 bg-surface/50 border-t border-default"
      aria-labelledby="target-heading"
    >
      <div className="max-w-7xl mx-auto px-6">
        <h2
          id="target-heading"
          className="text-3xl md:text-5xl font-heading font-bold mb-6 text-center"
        >
          {t('heading')}
        </h2>
        <p className="text-center text-secondary mb-16 max-w-2xl mx-auto text-lg">{t('sub')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {targets.map((target, idx) => (
            <motion.article
              key={target.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-6 rounded-xl bg-background border border-default hover:border-gold-dark/50 transition-colors group flex flex-col h-full"
            >
              <div className="w-10 h-10 rounded bg-surface text-gold flex items-center justify-center mb-6">
                {icons[idx % icons.length]}
              </div>
              <h3 className="text-xl font-bold mb-3">{target.title}</h3>
              <p className="text-sm text-secondary mb-6 leading-relaxed">{target.desc}</p>
              <ul className="space-y-3 mb-8 flex-1" aria-label={target.ariaLabel}>
                {target.points.map((point) => (
                  <li key={point} className="flex items-start text-xs text-muted leading-tight">
                    <span className="w-1 h-1 rounded-full bg-gold-dark mr-2 mt-1.5 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
              <a
                href="#poles"
                onClick={() => trackEvent('click_target_audience', { target: target.title })}
                className="text-sm font-semibold text-gold hover:text-gold-light flex items-center gap-1 transition-colors mt-auto w-fit"
              >
                {target.cta} <ChevronRight className="w-4 h-4" />
              </a>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}