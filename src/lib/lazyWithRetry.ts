import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { getSafeSessionStorage } from '../platform/storage/browserStorage';

const RETRY_STORAGE_KEY = 'explorer:lazy-retry';

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
      const safeSessionStorage = getSafeSessionStorage();

      if (safeSessionStorage) {
        safeSessionStorage.removeItem(getRetryKey(importKey));
      }

      return module;
    } catch (error) {
      const safeSessionStorage = getSafeSessionStorage();
      if (safeSessionStorage && isChunkLoadError(error)) {
        const retryKey = getRetryKey(importKey);
        const hasRetried = safeSessionStorage.getItem(retryKey) === '1';

        if (!hasRetried) {
          safeSessionStorage.setItem(retryKey, '1');
          window.location.reload();
          return new Promise<never>(() => {});
        }
      }

      throw error;
    }
  });
}
