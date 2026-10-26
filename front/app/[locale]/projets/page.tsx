import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { FolderCheck, Layers, CalendarDays, Globe, Eye, Gauge, Compass, ArrowRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import ProjectsClient from '@/components/projets/ProjectsClient';
import FeaturedProjects from '@/components/projets/FeaturedProjects';
import { FALLBACK_PROJECTS, getActiveProjects, getFeaturedProjects } from '@/lib/projects';
import { getProjects } from '@/lib/api';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://quarante.studio';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();

  const t = await getTranslations('meta');
  const enUrl = `${siteUrl}/en/projets`;

  return {
    title: t('projectsTitle'),
    description: t('projectsDescription'),
    keywords: [
      'projets QUARANTES',
      'réalisations IA Afrique',
      'projets KARABA OS',
      'KOF Corporation projets',
      'TÉPÉ jumeau numérique',
      'deeptech livrables',
    ],
    alternates: {
      canonical: locale === 'fr' ? `${siteUrl}/projets` : enUrl,
      languages: {
        fr: `${siteUrl}/projets`,
        en: enUrl,
        'x-default': `${siteUrl}/projets`,
      },
    },
    openGraph: {
      url: locale === 'fr' ? `${siteUrl}/projets` : enUrl,
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      title: `${t('projectsTitle')} — QUARANTES Holding`,
      description: t('projectsDescription'),
    },
  };
}

const statIcons = [FolderCheck, Layers, CalendarDays, Globe];
const framingIcons = [Eye, Gauge, Compass];

type FramingPoint = {
  title: string;
  desc: string;
};

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();

  setRequestLocale(locale);

  const t = await getTranslations('projects');
  const baseUrl = locale === 'fr' ? `${siteUrl}/projets` : `${siteUrl}/en/projets`;

  let projects = FALLBACK_PROJECTS;
  try {
    const fetched = await getProjects();
    if (fetched.length > 0) projects = fetched;
  } catch {
    // API injoignable : repli sur les données de secours.
  }

  const framingPoints = t.raw('framingPoints') as FramingPoint[];

  const stats = [
    { icon: statIcons[0], value: getActiveProjects(FALLBACK_PROJECTS), label: t('statsProjects'), desc: t('statsProjectsDesc') },
    { icon: statIcons[1], value: 4, label: t('statsPoles'), desc: t('statsPolesDesc') },
    { icon: statIcons[2], value: 3, label: t('statsYears'), desc: t('statsYearsDesc') },
    { icon: statIcons[3], value: 5, label: t('statsCountries'), desc: t('statsCountriesDesc') },
  ];

  const projectsPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${baseUrl}#page`,
    url: baseUrl,
    name: 'Projets — QUARANTES Holding',
    description: 'Réalisations internes des pôles QUARANTES, KOF Corporation, KARABA et TÉPÉ.',
    inLanguage: locale,
    isPartOf: { '@type': 'WebSite', '@id': `${siteUrl}/#website` },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: baseUrl },
        { '@type': 'ListItem', position: 2, name: 'Nos Projets', item: baseUrl },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectsPageSchema) }}
      />
      <Navbar />
      <main className="pt-20">
        <section
          className="relative py-24 md:py-32 overflow-hidden border-b border-default"
          aria-labelledby="projets-heading"
        >
          <div className="absolute inset-0 z-0 bg-neural-grid">
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gold-dark/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pulse/10 rounded-full blur-[120px]" />
            <div className="absolute inset-0 bg-quantum-noise opacity-20 mix-blend-overlay" />
          </div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-dark mb-4">
              {t('eyebrow')}
            </p>
            <h1 id="projets-heading" className="text-4xl md:text-6xl font-heading font-bold text-primary mb-6 max-w-3xl">
              {t('h1Line1')} <span className="text-gradient-gold">{t('h1Gold')}</span>
            </h1>
            <p className="text-lg text-secondary max-w-2xl leading-relaxed">{t('h1Sub')}</p>
          </div>
        </section>

        <section className="border-b border-default bg-surface/50" aria-label={t('statsProjects')}>
          <div className="max-w-7xl mx-auto px-6 py-12">
            <dl className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map(({ icon: Icon, value, label, desc }) => (
                <div key={label}>
                  <Icon className="w-6 h-6 text-gold-dark mb-3" aria-hidden="true" />
                  <dd className="text-4xl md:text-5xl font-heading font-bold text-gold">{value}</dd>
                  <dt className="mt-1 font-semibold text-primary">{label}</dt>
                  <p className="text-xs text-secondary">{desc}</p>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="py-20 border-b border-default" aria-labelledby="framing-heading">
          <div className="max-w-7xl mx-auto px-6">
            <h2 id="framing-heading" className="text-2xl md:text-4xl font-heading font-bold text-primary mb-12 max-w-2xl">
              {t('framingHeading')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {framingPoints.map(({ title, desc }, i) => {
                const Icon = framingIcons[i % framingIcons.length];
                return (
                  <div key={title} className="p-6 rounded-xl bg-background border border-default hover:border-gold-dark/50 transition-colors">
                    <div className="w-12 h-12 rounded bg-border-strong flex items-center justify-center mb-5 text-gold">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-heading font-bold text-primary mb-2">{title}</h3>
                    <p className="text-sm text-secondary leading-relaxed">{desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20 border-b border-default bg-surface/50" aria-labelledby="projects-grid-heading">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-10">
              <h2 id="projects-grid-heading" className="text-2xl md:text-4xl font-heading font-bold text-primary mb-3">
                {t('gridHeading')}
              </h2>
              <p className="text-secondary">{t('gridSub')}</p>
            </div>
            <ProjectsClient projects={projects} />
          </div>
        </section>

        <section className="py-20" aria-labelledby="featured-projects-heading">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-gold-dark mb-3">
                {t('featuredEyeBrow')}
              </p>
              <h2 id="featured-projects-heading" className="text-2xl md:text-4xl font-heading font-bold text-primary">
                {t('featuredHeading')}
              </h2>
              <p className="text-secondary mt-3 max-w-2xl">{t('featuredSub')}</p>
            </div>
            <FeaturedProjects projects={getFeaturedProjects(projects)} />
          </div>
        </section>

        <section className="py-16" aria-label={t('ctaHeading')}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="relative p-8 md:p-14 rounded-2xl cyber-border bg-background border-pulse/30 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-pulse/10 rounded-full blur-[90px]" aria-hidden="true" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-dark/10 rounded-full blur-[90px]" aria-hidden="true" />
              <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center justify-between">
                <div className="max-w-2xl">
                  <h2 className="text-2xl md:text-4xl font-heading font-bold text-primary mb-3">
                    {t('ctaHeading')}
                  </h2>
                  <p className="text-secondary leading-relaxed">{t('ctaP')}</p>
                </div>
                <Link
                  href="/careers"
                  className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded btn-lingot font-semibold"
                >
                  {t('ctaBtn')} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
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