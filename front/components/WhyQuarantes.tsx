'use client';

import { motion } from 'motion/react';
import { Globe, Layers, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';

const icons = [
  <Globe className="w-6 h-6" />,
  <Layers className="w-6 h-6" />,
  <Shield className="w-6 h-6" />,
];

type Reason = {
  title: string;
  points: string[];
};

export default function WhyQuarantes() {
  const t = useTranslations('why');
  const reasons = t.raw('reasons') as Reason[];

  return (
    <section
      className="py-32 bg-background border-y border-default relative overflow-hidden"
      aria-labelledby="why-heading"
    >
      <div className="absolute inset-0 bg-neural-grid opacity-20 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-16 md:mb-24 flex flex-col items-center text-center gap-4">
          <h2 id="why-heading" className="text-3xl md:text-5xl font-heading font-bold max-w-2xl">
            {t('heading')} <span className="text-gradient-gold">{t('headingGold')}</span>
          </h2>
          <p className="text-secondary text-lg max-w-2xl">{t('sub')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reasons.map((item, idx) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-8 rounded-xl bg-surface border border-default/60 hover:border-gold-dark transition-all flex flex-col"
            >
              <div className="w-14 h-14 rounded-lg bg-background border border-default flex items-center justify-center text-gold mb-6 shadow-inner">
                {icons[idx % icons.length]}
              </div>
              <h3 className="text-xl font-heading font-bold mb-4">{item.title}</h3>
              <ul
                className="text-secondary text-sm leading-relaxed space-y-2 flex-1"
                aria-label={item.title}
              >
                {item.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-gold-dark shrink-0 mt-2" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}