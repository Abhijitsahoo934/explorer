export function getSafeLocalStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function getSafeSessionStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

export function readStorageValue(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorageValue(storage: Storage, key: string, value: string): boolean {
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeStorageValue(storage: Storage, key: string): boolean {
  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function clearStorageKeys(storage: Storage, keys: readonly string[]): number {
  let removed = 0;

  for (const key of keys) {
    try {
      if (storage.getItem(key) !== null) {
        storage.removeItem(key);
        removed += 1;
      }
    } catch {
      /* ignore per-key storage failure */
    }
  }

  return removed;
}

export function safeStorageHasValue(storage: Storage, key: string, expectedValue: string): boolean {
  try {
    return storage.getItem(key) === expectedValue;
  } catch {
    return false;
  }
}
