import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
const GA_ENABLED = Boolean(GA_MEASUREMENT_ID) && import.meta.env.PROD;

function injectGaScript(measurementId: string) {
  if (document.querySelector(`script[data-ga-id="${measurementId}"]`)) {
    return;
  }

  const externalScript = document.createElement('script');
  externalScript.async = true;
  externalScript.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  externalScript.dataset.gaId = measurementId;
  document.head.appendChild(externalScript);

  const inlineScript = document.createElement('script');
  inlineScript.dataset.gaBootstrap = measurementId;
  inlineScript.text = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', '${measurementId}', { send_page_view: false });
  `;
  document.head.appendChild(inlineScript);
}

export function GoogleAnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (!GA_ENABLED || !GA_MEASUREMENT_ID) return;
    injectGaScript(GA_MEASUREMENT_ID);
  }, []);

  useEffect(() => {
    if (!GA_ENABLED || !GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;

    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: `${location.pathname}${location.search}`,
    });
  }, [location.pathname, location.search]);

  return null;
}
