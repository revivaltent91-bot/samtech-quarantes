import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import TargetAudience from '@/components/TargetAudience';
import Pillars from '@/components/Pillars';
import Convergence from '@/components/Convergence';
import Impact from '@/components/Impact';
import GlobalReach from '@/components/GlobalReach';
import SocialProof from '@/components/SocialProof';
import WhyQuarantes from '@/components/WhyQuarantes';
import AccessPaths from '@/components/AccessPaths';
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
  const baseUrl = locale === 'fr' ? siteUrl : `${siteUrl}/en`;

  return {
    title: t('homeTitle'),
    description: t('homeDescription'),
    alternates: {
      canonical: baseUrl,
      languages: {
        fr: siteUrl,
        en: `${siteUrl}/en`,
        'x-default': siteUrl,
      },
    },
    openGraph: {
      url: baseUrl,
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      title: `QUARANTES Holding — ${t('homeTitle')}`,
      description: t('homeDescription'),
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();

  setRequestLocale(locale);

  const baseUrl = locale === 'fr' ? siteUrl : `${siteUrl}/en`;

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${baseUrl}/#webpage`,
    url: baseUrl,
    name: 'QUARANTES Holding',
    description:
      "Cabinet d'expertise et consulting IA de bout en bout pour l'économie africaine.",
    inLanguage: locale,
    isPartOf: { '@type': 'WebSite', '@id': `${siteUrl}/#website` },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Accueil', item: baseUrl }],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <Navbar />
      <main>
        <Hero />
        <TargetAudience />
        <Pillars />
        <Convergence />
        <Impact />
        <GlobalReach />
        <SocialProof />
        <WhyQuarantes />
        <AccessPaths />
      </main>
      <Footer />
      <Suspense>
        <AnalyticsTracker />
      </Suspense>
    </>
  );
}