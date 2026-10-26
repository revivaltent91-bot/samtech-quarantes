'use client';

import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { trackEvent } from '@/lib/analytics';

export default function Hero() {
  const t = useTranslations('hero');

  const forWhoLink = (label: string) => (
    <a
      href="#pour-qui"
      className="px-3 py-1 bg-surface border border-default rounded-full hover:border-gold-dark hover:text-muted transition-colors"
    >
      {label}
    </a>
  );

  return (
    <section
      id="vision"
      className="relative min-h-screen flex items-center pt-20 overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <div className="absolute inset-0 z-0 bg-neural-grid">
        <div className="absolute top-1/4 right-0 w-1/2 h-full bg-[url('https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20 duotone-gold mask-image-linear-left" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pulse/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-gold-dark/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-quantum-noise opacity-20 mix-blend-overlay" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12 w-full">
        <div className="max-w-3xl flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-default bg-surface text-xs font-medium mb-8 text-secondary"
          >
            <span className="w-2 h-2 rounded-full bg-gold-dark animate-pulse" />
            {t('badge')}
          </motion.div>

          <motion.h1
            id="hero-heading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-heading font-bold leading-[1.1] tracking-tight mb-6"
          >
            {t('h1Line1')} <br className="hidden md:block" />
            {t('h1Line2Prefix')}
            <span className="text-gradient-gold">{t('h1Line2Excecution')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-secondary mb-6 leading-relaxed max-w-2xl"
          >
            {t('p')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap items-center gap-2 mb-10 text-xs font-medium text-muted"
          >
            <span className="mr-2 text-gold">{t('forWhoLabel')}</span>
            {forWhoLink(t('forWhoInstitutions'))}
            {forWhoLink(t('forWhoIndustrialists'))}
            {forWhoLink(t('forWhoLogistics'))}
            {forWhoLink(t('forWhoInvestors'))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap items-center gap-4"
          >
            <button
              onClick={() => trackEvent('click_cta', { cta_name: 'atelier_ia' })}
              className="group relative px-8 py-4 btn-lingot font-semibold rounded overflow-hidden transition-all hover:scale-105 shadow-lg shadow-gold-dark/20 text-black"
            >
              <span className="relative flex items-center gap-2">
                {t('ctaWorkshop')} <ArrowRight className="w-4 h-4 ml-1" />
              </span>
            </button>
            <a
              href="#poles"
              onClick={() => trackEvent('click_cta', { cta_name: 'explorer_ecosysteme' })}
              className="px-8 py-4 font-semibold rounded border border-default hover:bg-border-strong transition-colors flex items-center gap-2"
            >
              {t('ctaEcosystem')}
            </a>
          </motion.div>
        </div>

        <div className="flex-1 hidden lg:flex items-center justify-center relative w-full aspect-square md:aspect-auto">
          <div
            className="relative z-10 w-80 h-80 border border-gold-dark/20 rounded-full flex items-center justify-center animate-[spin_40s_linear_infinite]"
            aria-hidden="true"
          >
            <div className="absolute w-[120%] h-[120%] border border-pulse/10 rounded-full flex items-center justify-center animate-[spin_25s_linear_infinite_reverse]" />
            <div className="w-56 h-56 border border-default/40 rounded-full flex items-center justify-center">
              <div className="w-32 h-32 bg-gradient-gold rounded-full blur-3xl opacity-30 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}