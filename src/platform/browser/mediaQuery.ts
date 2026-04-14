type LegacyMediaQueryList = MediaQueryList & {
  addListener?: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void;
};

export function subscribeMediaQuery(
  mediaQuery: MediaQueryList,
  listener: (event?: MediaQueryListEvent) => void
): () => void {
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
