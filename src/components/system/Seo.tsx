import { useEffect } from 'react';

interface SeoProps {
  title: string;
  description?: string;
  robots?: string;
  canonicalPath?: string;
  keywords?: string[];
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

const DEFAULT_DESCRIPTION =
  'Explorero is a workspace operating system for organizing apps, folders, command workflows, and internet context in one premium interface.';

const SITE_URL = 'https://explorero.tech';

export function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  robots = 'index,follow',
  canonicalPath,
  keywords,
  structuredData,
}: SeoProps) {
  useEffect(() => {
    document.title = title;

    const upsertMeta = (key: string, value: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${key}"]` : `meta[name="${key}"]`;
      let el = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        if (isProperty) {
          el.setAttribute('property', key);
        } else {
          el.setAttribute('name', key);
        }
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    upsertMeta('description', description);
    upsertMeta('robots', robots);
    upsertMeta('og:title', title, true);
    upsertMeta('og:description', description, true);
    upsertMeta('og:url', canonicalPath ? `${SITE_URL}${canonicalPath}` : SITE_URL, true);
    upsertMeta('og:image', `${SITE_URL}/logo.jpg`, true);
    upsertMeta('twitter:title', title);
    upsertMeta('twitter:description', description);
    upsertMeta('twitter:image', `${SITE_URL}/logo.jpg`);
    upsertMeta('twitter:card', 'summary_large_image');

    if (keywords?.length) {
      upsertMeta('keywords', keywords.join(', '));
    }

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }

    canonical.href = canonicalPath ? `${SITE_URL}${canonicalPath}` : SITE_URL;

    const existingScripts = Array.from(
      document.head.querySelectorAll('script[data-seo-structured-data="true"]')
    ) as HTMLScriptElement[];
    existingScripts.forEach((script) => script.remove());

    if (structuredData) {
      const entries = Array.isArray(structuredData) ? structuredData : [structuredData];
      entries.forEach((entry) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.dataset.seoStructuredData = 'true';
        script.text = JSON.stringify(entry);
        document.head.appendChild(script);
      });
    }
  }, [canonicalPath, description, keywords, robots, structuredData, title]);

  return null;
}
