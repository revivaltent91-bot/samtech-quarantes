'use client';

import { motion } from 'motion/react';
import { Layers, Cpu, Network, Globe, ChevronRight, ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { trackEvent } from '@/lib/analytics';

const pillars = [
  {
    name: 'Quarantes',
    tag: 'Tête de Groupe & Orchestration',
    desc: "Le cabinet conseil tête de groupe : Stratégie IA, gouvernance et orchestration des pôles d'innovation.",
    icon: <Layers className="w-6 h-6" />,
    image:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop',
    color: 'from-blue-500/20 to-purple-500/20',
    link: '#',
    external: false,
  },
  {
    name: 'KOF Corporation',
    tag: 'Infrastructure & Edge',
    desc: "L'Usine Hard/Soft : Ingénierie logicielle, Mécatronique, Circuits imprimés, Impression 3D.",
    icon: <Cpu className="w-6 h-6" />,
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop',
    color: 'from-orange-500/20 to-red-500/20',
    link: 'https://kofcorporation.com/',
    external: true,
  },
  {
    name: 'KARABA',
    tag: 'OS Logistique & IA Agentique',
    desc: "Le système d'exploitation de l'économie réelle africaine.",
    icon: <Network className="w-6 h-6" />,
    image:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop',
    color: 'from-green-500/20 to-emerald-500/20',
    link: '#',
    external: false,
  },
  {
    name: 'TÉPÉ',
    tag: 'Intelligence & Gouvernance',
    desc: 'Intelligence Institutionnelle, Analyse prédictive pour gouvernements et éducation.',
    icon: <Globe className="w-6 h-6" />,
    image:
      'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=1000&auto=format&fit=crop',
    color: 'from-gold-dark/20 to-gold/20',
    link: '#',
    external: false,
  },
];

export default function Pillars() {
  const t = useTranslations('pillars');

  return (
    <section id="poles" className="py-32 relative" aria-labelledby="pillars-heading">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 md:mb-24">
          <h2 id="pillars-heading" className="text-3xl md:text-5xl font-heading font-bold mb-6">
            {t('heading')}
          </h2>
          <p className="text-secondary max-w-2xl text-lg">{t('sub')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar, idx) => (
            <motion.div
              key={pillar.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="h-full"
            >
              <a
                href={pillar.link}
                onClick={() => trackEvent('click_pillar', { pillar_name: pillar.name })}
                {...(pillar.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="block group relative p-8 rounded-xl bg-surface border border-default overflow-hidden hover:border-gold-dark/50 transition-colors h-full flex flex-col"
                aria-label={`${t('ariaLabel')} ${pillar.name}${pillar.external ? ' (ouverture externe)' : ''}`}
              >
                <div className="absolute inset-0 z-0">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-30 transition-opacity duration-700 duotone-gold"
                    style={{ backgroundImage: `url('${pillar.image}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/90 to-surface/40 group-hover:via-surface/80 transition-all duration-700" />
                </div>
                <div
                  className={`absolute inset-0 z-0 bg-gradient-to-br ${pillar.color} opacity-0 group-hover:opacity-60 transition-opacity duration-500`}
                />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-12 h-12 rounded bg-border-strong flex items-center justify-center mb-6 text-gold group-hover:scale-110 transition-transform">
                    {pillar.icon}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-gold font-bold mb-2">
                    {pillar.tag}
                  </div>
                  <h3 className="text-2xl font-heading font-bold mb-3 group-hover:text-gradient-gold transition-all">
                    {pillar.name}
                  </h3>
                  <p className="text-secondary mb-8 flex-1">{pillar.desc}</p>
                  <div className="flex items-center text-sm font-semibold text-gold mt-auto">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 flex items-center">
                      {t('exploreLabel')} <ChevronRight className="w-4 h-4 ml-1" />
                      {pillar.external && <ArrowUpRight className="w-3 h-3 ml-1" />}
                    </span>
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}