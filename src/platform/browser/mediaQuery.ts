type LegacyMediaQueryList = MediaQueryList & {
  addListener?: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void;
};

export function getMediaQueryList(query: string): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return null;
  }

  try {
    return window.matchMedia(query);
  } catch {
    return null;
  }
}

export function matchesMediaQuery(query: string, fallback = false): boolean {
  return getMediaQueryList(query)?.matches ?? fallback;
}

export function subscribeMediaQuery(
  mediaQuery: MediaQueryList | null,
  listener: (event?: MediaQueryListEvent) => void
): () => void {
  if (!mediaQuery) {
    return () => {};
  }

  const wrappedListener = (event?: MediaQueryListEvent) => listener(event);

  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', wrappedListener);
    return () => mediaQuery.removeEventListener('change', wrappedListener);
  }

  const legacyMediaQuery = mediaQuery as LegacyMediaQueryList;
  legacyMediaQuery.addListener?.(wrappedListener as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
  return () =>
    legacyMediaQuery.removeListener?.(wrappedListener as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
}
