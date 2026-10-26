import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import ThemeProvider from '@/components/ThemeProvider';
import { noFoucScript } from '@/lib/theme';
import '../globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://quarante.studio';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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
    metadataBase: new URL(siteUrl),
    title: {
      default: `QUARANTES Holding — ${t('homeTitle')}`,
      template: '%s | QUARANTES Holding',
    },
    description: t('homeDescription'),
    keywords: [
      'intelligence artificielle',
      'consulting IA',
      'Afrique',
      'deeptech',
      'edge computing',
      'mécatronique',
      'logistique',
      'KARABA',
      'KOF Corporation',
      'TÉPÉ',
      'Quarantes',
      'Lomé',
      'Togo',
    ],
    authors: [{ name: 'QUARANTES Holding' }],
    creator: 'QUARANTES Holding',
    publisher: 'QUARANTES Holding',
    formatDetection: { email: false, address: false, telephone: false },
    alternates: {
      canonical: baseUrl,
      languages: {
        fr: siteUrl,
        en: `${siteUrl}/en`,
        'x-default': siteUrl,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#F6F4EC',
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'QUARANTES Holding',
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  description:
    'Cabinet d\'expertise et consulting IA Hard & Soft pour l\'économie réelle africaine.',
  foundingDate: '2023',
  foundingLocation: {
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Lomé',
      addressCountry: 'TG',
    },
  },
  sameAs: ['https://www.linkedin.com/company/quarantes/'],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['French', 'English'],
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Services IA Hard & Soft',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Stratégie IA & Consulting' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Edge Computing & Mécatronique' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Logistique & IA Agentique' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Intelligence Institutionnelle' } },
    ],
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'QUARANTES Holding',
  url: siteUrl,
  inLanguage: ['fr', 'en'],
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}/search?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFoucScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="min-h-screen bg-background text-primary">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}