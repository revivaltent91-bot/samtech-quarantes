import type { MetadataRoute } from 'next';
import { FALLBACK_ARTICLES } from '@/lib/articles';
import { getArticles } from '@/lib/api';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://quarante.studio';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let articles = FALLBACK_ARTICLES;
  try {
    const fetched = await getArticles();
    if (fetched.length > 0) articles = fetched;
  } catch {
    // API injoignable : repli sur les données de secours.
  }

  const articleUrls: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteUrl}/insights/${article.slug}`,
    lastModified: new Date(article.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
    alternates: {
      languages: {
        fr: `${siteUrl}/insights/${article.slug}`,
        en: `${siteUrl}/en/insights/${article.slug}`,
      },
    },
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
      alternates: {
        languages: {
          fr: siteUrl,
          en: `${siteUrl}/en`,
        },
      },
    },
    {
      url: `${siteUrl}/projets`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: {
        languages: {
          fr: `${siteUrl}/projets`,
          en: `${siteUrl}/en/projets`,
        },
      },
    },
    {
      url: `${siteUrl}/insights`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          fr: `${siteUrl}/insights`,
          en: `${siteUrl}/en/insights`,
        },
      },
    },
    {
      url: `${siteUrl}/careers`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          fr: `${siteUrl}/careers`,
          en: `${siteUrl}/en/careers`,
        },
      },
    },
    ...articleUrls,
  ];
}