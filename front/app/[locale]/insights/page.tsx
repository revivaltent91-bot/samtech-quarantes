import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Compass, Cpu, TrendingUp, ArrowRight, Calendar, Clock } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import InsightsClient from '@/components/insights/InsightsClient';
import { FALLBACK_ARTICLES, formatDate } from '@/lib/articles';
import { getArticles } from '@/lib/api';
import type { Article } from '@/lib/articles';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://quarante.studio';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();

  const t = await getTranslations('meta');
  const baseUrl = locale === 'fr' ? siteUrl : `${siteUrl}/en`;
  const enUrl = `${siteUrl}/en/insights`;

  return {
    title: t('insightsTitle'),
    description: t('insightsDescription'),
    keywords: [
      'blog IA Afrique',
      'analyses intelligences artificielle',
      'edge computing Afrique',
      'logistique agentique',
      'QUARANTES insights',
      'recherche IA continent',
    ],
    alternates: {
      canonical: locale === 'fr' ? `${siteUrl}/insights` : enUrl,
      languages: {
        fr: `${siteUrl}/insights`,
        en: enUrl,
        'x-default': `${siteUrl}/insights`,
      },
    },
    openGraph: {
      url: baseUrl,
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      title: `${t('insightsTitle')} — QUARANTES Holding`,
      description: t('insightsDescription'),
    },
  };
}

const editorialAxes = [
  {
    icon: <Cpu className="w-6 h-6" />,
    title: 'Recherche & Ingénierie',
    desc: 'Publications techniques issues de Quarantes Studio : IA agentique, edge intelligence, robustesse réseau.',
  },
  {
    icon: <Compass className="w-6 h-6" />,
    title: 'Terrain & Impact',
    desc: "Retours d'expérience sectoriels : logistique, distribution, gouvernance et données, mesurés sur site.",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Vision & Stratégie',
    desc: "Analyses sur l'IA appliquée à l'économie réelle africaine, à destination des décideurs.",
  },
];

export default async function InsightsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();

  setRequestLocale(locale);

  const t = await getTranslations('insights');
  const baseUrl = locale === 'fr' ? siteUrl : `${siteUrl}/en/insights`;

  let articles: Article[] = FALLBACK_ARTICLES;
  try {
    const fetched = await getArticles();
    if (fetched.length > 0) articles = fetched;
  } catch {
    // API injoignable : repli sur les données de secours.
  }

  const featuredArticle = articles.find((a) => a.featured) ?? articles[0];
  const nonFeatured = articles.filter((a) => a.slug !== featuredArticle.slug);

  const insightsPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${baseUrl}#page`,
    url: baseUrl,
    name: 'Insights — QUARANTES Holding',
    description: 'Publications et analyses de QUARANTES Holding.',
    inLanguage: locale,
    isPartOf: { '@type': 'WebSite', '@id': `${siteUrl}/#website` },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: baseUrl },
        { '@type': 'ListItem', position: 2, name: 'Insights', item: baseUrl },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(insightsPageSchema) }}
      />
      <Navbar />
      <main className="pt-20">
        <section
          className="relative py-32 overflow-hidden border-b border-default"
          aria-labelledby="insights-hero-heading"
        >
          <div className="absolute inset-0 z-0 bg-neural-grid">
            <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-pulse/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-dark/10 rounded-full blur-[120px]" />
            <div className="absolute inset-0 bg-quantum-noise opacity-20 mix-blend-overlay" />
          </div>
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-default bg-surface text-xs font-medium mb-8 text-secondary">
              <span className="w-2 h-2 rounded-full bg-gold-dark animate-pulse" />
              {t('heroBadge')}
            </div>
            <h1
              id="insights-hero-heading"
              className="text-5xl md:text-7xl font-heading font-bold mb-6"
            >
              {t('h1Line1')} <span className="text-gradient-gold">{t('h1Gold')}</span>
            </h1>
            <p className="text-xl text-secondary max-w-2xl mx-auto leading-relaxed">{t('heroSub')}</p>
          </div>
        </section>

        <section
          className="py-24 bg-surface/50 border-b border-default"
          aria-labelledby="why-pubs-heading"
        >
          <div className="max-w-7xl mx-auto px-6">
            <h2
              id="why-pubs-heading"
              className="text-3xl md:text-5xl font-heading font-bold mb-6 text-center"
            >
              {t('whyPubsHeading')}
            </h2>
            <p className="text-secondary max-w-2xl mx-auto text-center mb-16">{t('whyPubsSub')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {editorialAxes.map((axis) => (
                <article
                  key={axis.title}
                  className="p-8 rounded-xl bg-background border border-default hover:border-gold-dark/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded bg-border-strong flex items-center justify-center mb-6 text-gold">
                    {axis.icon}
                  </div>
                  <h3 className="text-xl font-heading font-bold mb-3">{axis.title}</h3>
                  <p className="text-secondary text-sm leading-relaxed">{axis.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24" aria-labelledby="featured-heading">
          <div className="max-w-7xl mx-auto px-6">
            <div className="relative overflow-hidden rounded-2xl cyber-border bg-background">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-20 duotone-gold"
                style={{ backgroundImage: `url('${featuredArticle.heroImage}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-background via-background/70 to-transparent" />
              <div className="relative z-10 p-8 md:p-14 max-w-3xl">
                <h2 id="featured-heading" className="sr-only">
                  {t('featuredLabel')}
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold-dark/40 bg-gold-dark/10 text-xs font-medium mb-6 text-gold">
                  {t('featuredLabel')} · {featuredArticle.pole}
                </div>
                <h3 className="text-2xl md:text-4xl font-heading font-bold mb-4 text-primary">
                  {featuredArticle.title}
                </h3>
                <p className="text-secondary leading-relaxed mb-6">{featuredArticle.excerpt}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-secondary mb-8">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gold-dark" />
                    {formatDate(featuredArticle.publishedAt)}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gold-dark" />
                    {featuredArticle.readTime} {t('readTime')}
                  </span>
                </div>
                <Link
                  href={`/insights/${featuredArticle.slug}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded btn-lingot font-semibold"
                >
                  {t('readArticle')} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section
          className="py-24 bg-surface/50 border-t border-default"
          aria-labelledby="articles-heading"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2
                  id="articles-heading"
                  className="text-3xl md:text-5xl font-heading font-bold mb-4"
                >
                  {t('allArticlesHeading')}
                </h2>
                <p className="text-secondary">{t('allArticlesSub')}</p>
              </div>
            </div>

            <Suspense fallback={null}>
              <InsightsClient articles={nonFeatured} />
            </Suspense>
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