import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

const RETRY_STORAGE_KEY = 'explorer:lazy-retry';

function canUseSessionStorage() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

function getRetryKey(importKey: string) {
  return `${RETRY_STORAGE_KEY}:${importKey}`;
}

function isChunkLoadError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? '');
  const lowerMessage = message.toLowerCase();

  return (
    lowerMessage.includes('failed to fetch dynamically imported module') ||
    lowerMessage.includes('importing a module script failed') ||
    lowerMessage.includes('loading chunk') ||
    lowerMessage.includes('chunkloaderror')
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyWithRetry<T extends ComponentType<any>>(
  importer: () => Promise<{ default: T }>,
  importKey: string
) : LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      const module = await importer();

      if (canUseSessionStorage()) {
        window.sessionStorage.removeItem(getRetryKey(importKey));
      }

      return module;
    } catch (error) {
      if (canUseSessionStorage() && isChunkLoadError(error)) {
        const retryKey = getRetryKey(importKey);
        const hasRetried = window.sessionStorage.getItem(retryKey) === '1';

        if (!hasRetried) {
          window.sessionStorage.setItem(retryKey, '1');
          window.location.reload();
          return new Promise<never>(() => {});
        }
      }

      throw error;
    }
  });
}
