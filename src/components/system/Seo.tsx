import { useEffect } from 'react';

interface SeoProps {
  title: string;
  description?: string;
  robots?: string;
  canonicalPath?: string;
}

const DEFAULT_DESCRIPTION =
  'Explorer is a workspace operating system for organizing apps, folders, command workflows, and internet context in one premium interface.';

const SITE_URL = 'https://explorero.tech';

export function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  robots = 'index,follow',
  canonicalPath,
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
    upsertMeta('twitter:title', title);
    upsertMeta('twitter:description', description);

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }

    canonical.href = canonicalPath ? `${SITE_URL}${canonicalPath}` : SITE_URL;
  }, [canonicalPath, description, robots, title]);

  return null;
}
