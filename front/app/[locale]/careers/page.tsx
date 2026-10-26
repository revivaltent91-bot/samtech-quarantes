import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Cpu, Globe, Zap, Target, Users, Briefcase, ArrowRight, ArrowUpRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnalyticsTracker from '@/components/AnalyticsTracker';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://quarante.studio';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();

  const t = await getTranslations('meta');
  const enUrl = `${siteUrl}/en/careers`;

  return {
    title: t('careersTitle'),
    description: t('careersDescription'),
    keywords: [
      'carrières IA Afrique',
      'emploi deeptech',
      'recrutement intelligence artificielle',
      'jobs edge computing',
      'QUARANTES recrutement',
      'mécatronique Lomé',
    ],
    alternates: {
      canonical: locale === 'fr' ? `${siteUrl}/careers` : enUrl,
      languages: {
        fr: `${siteUrl}/careers`,
        en: enUrl,
        'x-default': `${siteUrl}/careers`,
      },
    },
    openGraph: {
      url: locale === 'fr' ? `${siteUrl}/careers` : enUrl,
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      title: `${t('careersTitle')} — QUARANTES Holding`,
      description: t('careersDescription'),
    },
  };
}

const jobs = [
  { title: 'Senior AI Research Scientist', pole: 'KARABA', location: 'Lomé / Remote', type: 'Full-time' },
  { title: 'Lead Mechatronics Engineer', pole: 'KOF Corporation', location: 'Lomé', type: 'Full-time' },
  { title: 'Data Strategist', pole: 'TÉPÉ', location: 'Lomé / Remote', type: 'Full-time' },
  { title: 'Edge Computing Architect', pole: 'Quarantes Studio', location: 'Remote', type: 'Full-time' },
];

type ReasonPoint = { title: string; p: string };
type CulturePoint = { title: string; desc: string };
type ProcessStep = { title: string; desc: string };

export default async function CareersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();

  setRequestLocale(locale);

  const t = await getTranslations('careers');
  const baseUrl = locale === 'fr' ? `${siteUrl}/careers` : `${siteUrl}/en/careers`;

  const whyJoinPoints = t.raw('whyJoinPoints') as ReasonPoint[];
  const rdPoints = t.raw('rdPoints') as ReasonPoint[];
  const culturePoints = t.raw('culturePoints') as CulturePoint[];
  const processSteps = t.raw('processSteps') as ProcessStep[];

  const careersPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${baseUrl}#webpage`,
    url: baseUrl,
    name: 'Carrières — QUARANTES Holding',
    description: 'Opportunités de carrière chez QUARANTES Holding',
    inLanguage: locale,
    isPartOf: { '@type': 'WebSite', '@id': `${siteUrl}/#website` },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: baseUrl },
        { '@type': 'ListItem', position: 2, name: 'Carrières', item: baseUrl },
      ],
    },
  };

  const jobPostingsSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Postes ouverts chez QUARANTES Holding',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@type': 'JobPosting',
          title: 'Senior AI Research Scientist',
          hiringOrganization: { '@type': 'Organization', name: 'QUARANTES Holding' },
          jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: 'Lomé', addressCountry: 'TG' } },
          employmentType: 'FULL_TIME',
          description: 'Recherche et développement en IA agentique pour KARABA OS.',
        },
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: {
          '@type': 'JobPosting',
          title: 'Lead Mechatronics Engineer',
          hiringOrganization: { '@type': 'Organization', name: 'QUARANTES Holding' },
          jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: 'Lomé', addressCountry: 'TG' } },
          employmentType: 'FULL_TIME',
          description: 'Ingénierie mécatronique et prototypage hardware pour KOF Corporation.',
        },
      },
      {
        '@type': 'ListItem',
        position: 3,
        item: {
          '@type': 'JobPosting',
          title: 'Data Strategist',
          hiringOrganization: { '@type': 'Organization', name: 'QUARANTES Holding' },
          jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: 'Lomé', addressCountry: 'TG' } },
          employmentType: 'FULL_TIME',
          description: 'Stratégie de données et intelligence institutionnelle pour TÉPÉ.',
        },
      },
      {
        '@type': 'ListItem',
        position: 4,
        item: {
          '@type': 'JobPosting',
          title: 'Edge Computing Architect',
          hiringOrganization: { '@type': 'Organization', name: 'QUARANTES Holding' },
          employmentType: 'FULL_TIME',
          description: 'Architecture Edge Computing et déploiement de modèles IA embarqués.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(careersPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingsSchema) }}
      />
      <Navbar />
      <main className="pt-20">
        <section
          className="relative py-32 overflow-hidden border-b border-default"
          aria-labelledby="careers-hero-heading"
        >
          <div className="absolute inset-0 z-0 bg-neural-grid">
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gold-dark/10 rounded-full blur-[120px]" />
            <div className="absolute inset-0 bg-quantum-noise opacity-20 mix-blend-overlay" />
          </div>
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-default bg-surface text-xs font-medium mb-8 text-secondary">
              <span className="w-2 h-2 rounded-full bg-gold-dark animate-pulse" />
              {t('heroBadge')}
            </div>
            <h1
              id="careers-hero-heading"
              className="text-5xl md:text-7xl font-heading font-bold mb-6"
            >
              {t('h1Line1')}
              <span className="text-gradient-gold">{t('h1Gold')}</span>
            </h1>
            <p className="text-xl text-secondary max-w-2xl mx-auto leading-relaxed">{t('heroSub')}</p>
          </div>
        </section>

        <section className="py-24 border-b border-default" aria-labelledby="why-join-heading">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="flex-1">
                <h2
                  id="why-join-heading"
                  className="text-3xl md:text-5xl font-heading font-bold mb-6"
                >
                  {t('whyJoinHeading')}
                </h2>
                <p className="text-xl text-gold mb-8 font-medium">{t('whyJoinKicker')}</p>
                <div className="space-y-6 text-secondary leading-relaxed">
                  {whyJoinPoints.map((point) => (
                    <p key={point.title}>
                      <strong className="text-primary">{point.title}</strong> {point.p}
                    </p>
                  ))}
                </div>
              </div>
              <div className="flex-1 relative w-full aspect-square md:aspect-[4/3] rounded-2xl cyber-border bg-surface overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1531297172867-4f50f1636784?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30 duotone-gold" />
                <div className="absolute inset-0 bg-gradient-to-tr from-background via-transparent to-gold-dark/20" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="p-6 rounded-xl bg-background/60 backdrop-blur-md border border-default/50">
                    <div className="flex items-center gap-4 mb-2">
                      <Zap className="w-5 h-5 text-gold" />
                      <span className="font-bold text-primary">{t('innovationRadical')}</span>
                    </div>
                    <p className="text-sm text-muted">{t('innovationRadicalDesc')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-24 p-8 md:p-12 rounded-2xl cyber-border bg-background relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-pulse/10 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-dark/10 rounded-full blur-[80px]" />
              <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pulse/30 bg-pulse/10 text-xs font-medium mb-6 text-glow">
                    <Cpu className="w-4 h-4" /> {t('rdBadge')}
                  </div>
                  <h3 className="text-2xl md:text-4xl font-heading font-bold mb-4 text-primary">
                    {t('rdHeading')}
                  </h3>
                  <p className="text-secondary mb-6 leading-relaxed">{t('rdP')}</p>
                  <ul className="space-y-4 text-sm text-muted mb-8">
                    {rdPoints.map((point) => (
                      <li key={point.title} className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-gold shrink-0" />
                        <span>
                          <strong>{point.title}</strong> {point.p}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button className="px-6 py-3 border border-gold text-gold font-semibold rounded hover:bg-gold hover:text-black transition-colors flex items-center gap-2 text-sm w-fit">
                    {t('rdBtn')} <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
                <div className="w-full md:w-1/3 aspect-square rounded-xl cyber-border overflow-hidden relative">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-50 duotone-gold" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className="absolute inset-0 bg-neural-grid opacity-30" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="py-24 bg-surface/50 border-b border-default"
          aria-labelledby="culture-heading"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16 text-center">
              <h2
                id="culture-heading"
                className="text-3xl md:text-5xl font-heading font-bold mb-6"
              >
                {t('cultureHeading')}
              </h2>
              <p className="text-secondary max-w-2xl mx-auto">{t('cultureSub')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: <Target className="w-6 h-6" />, i: 0 },
                { icon: <Globe className="w-6 h-6" />, i: 1 },
                { icon: <Users className="w-6 h-6" />, i: 2 },
              ].map(({ icon, i }) => {
                const item = culturePoints[i];
                return (
                  <article
                    key={item.title}
                    className="p-8 rounded-xl bg-background border border-default hover:border-gold-dark/50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded bg-border-strong flex items-center justify-center mb-6 text-gold">
                      {icon}
                    </div>
                    <h3 className="text-xl font-heading font-bold mb-3">{item.title}</h3>
                    <p className="text-secondary text-sm leading-relaxed">{item.desc}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-24" aria-labelledby="openings-heading">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2
                  id="openings-heading"
                  className="text-3xl md:text-5xl font-heading font-bold mb-4"
                >
                  {t('openingsHeading')}
                </h2>
                <p className="text-secondary">{t('openingsSub')}</p>
              </div>
              <button className="px-6 py-3 rounded border border-default hover:bg-border-strong transition-colors text-sm font-medium flex items-center gap-2">
                {t('spontaneous')} <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4" role="list" aria-label={t('openingsHeading')}>
              {jobs.map((job) => (
                <div
                  key={job.title}
                  role="listitem"
                  className="group flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-xl bg-surface border border-default hover:border-gold-dark transition-all cursor-pointer"
                >
                  <div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-gold transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-secondary">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" /> {job.pole}
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-4 h-4" /> {job.location}
                      </span>
                      <span className="px-2 py-1 rounded bg-border-strong text-xs">{job.type}</span>
                    </div>
                  </div>
                  <button className="mt-4 md:mt-0 px-6 py-2 rounded btn-lingot font-semibold opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0">
                    {t('apply')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className="py-24 bg-surface border-t border-default"
          aria-labelledby="process-heading"
        >
          <div className="max-w-7xl mx-auto px-6">
            <h2
              id="process-heading"
              className="text-3xl md:text-5xl font-heading font-bold mb-16 text-center"
            >
              {t('processHeading')}
            </h2>
            <ol className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              <div className="hidden md:block absolute top-6 left-12 right-12 h-px bg-border-strong" aria-hidden="true" />
              {processSteps.map((step, idx) => (
                <li
                  key={step.title}
                  className="relative z-10 flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-background border-2 border-gold-dark flex items-center justify-center text-gold font-bold mb-6">
                    {idx + 1}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-secondary text-sm">{step.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <Footer />
      <Suspense>
        <AnalyticsTracker />
      </Suspense>
    </>
  );
}