import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Calendar, Clock, ChevronRight, ArrowRight, ArrowUpRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import ArticleContent from '@/components/insights/ArticleContent';
import { FALLBACK_ARTICLES, getHeadings, getRelatedArticles, formatDate } from '@/lib/articles';
import { getArticles, getArticle as getArticleFromApi } from '@/lib/api';
import type { Article } from '@/lib/articles';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://quarante.studio';

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateStaticParams() {
  let articles = FALLBACK_ARTICLES;
  try {
    const fetched = await getArticles();
    if (fetched.length > 0) articles = fetched;
  } catch {
    // API injoignable : repli sur les données de secours.
  }
  return articles.map((article) => ({ slug: article.slug }));
}

export const dynamicParams = true;

async function resolveSource(): Promise<Article[]> {
  try {
    const fetched = await getArticles();
    return fetched.length > 0 ? fetched : FALLBACK_ARTICLES;
  } catch {
    return FALLBACK_ARTICLES;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const source = await resolveSource();
  const article =
    source.find((a) => a.slug === slug) ?? (await getArticleFromApi(slug)) ?? undefined;

  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt,
    alternates: {
      canonical: `${siteUrl}/insights/${article.slug}`,
      languages: {
        fr: `${siteUrl}/insights/${article.slug}`,
        en: `${siteUrl}/en/insights/${article.slug}`,
        'x-default': `${siteUrl}/insights/${article.slug}`,
      },
    },
    openGraph: {
      type: 'article',
      url: `${siteUrl}/insights/${article.slug}`,
      locale: 'fr_FR',
      title: `${article.title} — QUARANTES Holding`,
      description: article.excerpt,
      publishedTime: article.publishedAt,
      authors: [article.author.name],
      section: article.pole,
      images: [{ url: article.heroImage, alt: article.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${article.title} — QUARANTES Holding`,
      description: article.excerpt,
      images: [article.heroImage],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const source = await resolveSource();
  const article =
    (await getArticleFromApi(slug)) ?? source.find((a) => a.slug === slug) ?? undefined;

  if (!article) notFound();

  const t = await getTranslations('article');
  const tInsights = await getTranslations('insights');
  const headings = getHeadings(article);
  const related = getRelatedArticles(source, article, 3);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    image: article.heroImage,
    inLanguage: 'fr',
    mainEntityOfPage: `${siteUrl}/insights/${article.slug}`,
    author: {
      '@type': 'Organization',
      name: `QUARANTES Holding — ${article.author.role}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'QUARANTES Holding',
      url: siteUrl,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Insights', item: `${siteUrl}/insights` },
      { '@type': 'ListItem', position: 3, name: article.title, item: `${siteUrl}/insights/${article.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Navbar />
      <main className="pt-20">
        <article className="relative overflow-hidden border-b border-default">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20 duotone-gold"
            style={{ backgroundImage: `url('${article.heroImage}')` }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
          <div className="relative z-10 max-w-3xl mx-auto px-6 py-20 md:py-28">
            <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-sm text-secondary mb-8 flex-wrap">
              <Link href="/" className="hover:text-gold transition-colors">{t('home')}</Link>
              <ChevronRight className="w-4 h-4 text-muted" />
              <Link href="/insights" className="hover:text-gold transition-colors">{t('insights')}</Link>
              <ChevronRight className="w-4 h-4 text-muted" />
              <span className="text-primary/80">{article.pole}</span>
            </nav>

            <Link
              href="/insights"
              className="inline-flex w-fit items-center gap-2 px-3 py-1 rounded-full border border-default bg-surface text-xs font-medium text-gold hover:border-gold-dark transition-colors"
            >
              {article.pole}
            </Link>

            <h1 className="text-4xl md:text-6xl font-heading font-bold text-primary mt-6 mb-6 leading-tight">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-secondary mb-8">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold-dark" />
                {formatDate(article.publishedAt)}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-dark" />
                {article.readTime} {tInsights('readTime')}
              </span>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-background/60 backdrop-blur-md border border-default/50 w-fit">
              <div className="w-12 h-12 rounded-full bg-border-strong border border-gold-dark/40 flex items-center justify-center font-heading font-bold text-gold">
                {article.author.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </div>
              <div>
                <p className="font-semibold text-primary">{article.author.name}</p>
                <p className="text-xs text-secondary">{article.author.role}</p>
              </div>
            </div>
          </div>
        </article>

        <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className={headings.length >= 2 ? 'grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-12' : ''}>
            {headings.length >= 2 && (
              <aside className="hidden lg:block" aria-label={t('tocTitle')}>
                <nav className="sticky top-28">
                  <p className="text-xs uppercase tracking-wider text-muted font-bold mb-4">
                    {t('tocTitle')}
                  </p>
                  <ol className="space-y-2 text-sm">
                    {headings.map((h) => (
                      <li key={h.id}>
                        <a
                          href={`#${h.id}`}
                          className="text-secondary hover:text-gold transition-colors block py-1 border-l border-default pl-4 hover:border-gold-dark"
                        >
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              </aside>
            )}

            <div className="max-w-2xl">
              <ArticleContent blocks={article.blocks} />
            </div>
          </div>
        </section>

        <section className="py-16 border-t border-default" aria-label={t('endCtaHeading')}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="relative p-8 md:p-12 rounded-2xl cyber-border bg-background overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-pulse/10 rounded-full blur-[90px]" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-dark/10 rounded-full blur-[90px]" />
              <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center justify-between">
                <div className="max-w-2xl">
                  <h2 className="text-2xl md:text-4xl font-heading font-bold mb-3 text-primary">
                    {t('endCtaHeading')}
                  </h2>
                  <p className="text-secondary leading-relaxed">{t('endCtaP')}</p>
                </div>
                <Link
                  href="/careers"
                  className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded btn-lingot font-semibold"
                >
                  {t('endCtaBtn')} <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="py-16 bg-surface/50 border-t border-default" aria-labelledby="related-heading">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-end justify-between mb-10">
                <h2 id="related-heading" className="text-3xl md:text-4xl font-heading font-bold">
                  {t('relatedHeading')}
                </h2>
                <Link
                  href="/insights"
                  className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-gold hover:text-gold-light transition-colors"
                >
                  {t('allArticles')} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {related.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/insights/${rel.slug}`}
                    className="group flex flex-col overflow-hidden rounded-xl bg-background border border-default hover:border-gold-dark transition-colors"
                  >
                    <div
                      className="relative h-40 overflow-hidden"
                      style={{ backgroundImage: `url('${rel.heroImage}')` }}
                      aria-hidden="true"
                    >
                      <div className="absolute inset-0 bg-cover bg-center opacity-40 duotone-gold transition-opacity duration-500 group-hover:opacity-70" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <span className="inline-flex w-fit px-2 py-1 rounded bg-border-strong text-xs font-medium text-glow mb-3">
                        {rel.pole}
                      </span>
                      <h3 className="font-heading font-bold mb-3 group-hover:text-gold transition-colors leading-snug">
                        {rel.title}
                      </h3>
                      <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-gold">
                        {tInsights('readArticle')}
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
      <Suspense>
        <AnalyticsTracker />
      </Suspense>
    </>
  );
}