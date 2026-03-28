/**
 * Startup performance helper:
 * Warm likely post-auth routes to reduce perceived latency after login.
 */
let hasPrefetchedAuthRoutes = false;

export function prefetchAuthenticatedRoutes() {
  if (hasPrefetchedAuthRoutes) return;
  hasPrefetchedAuthRoutes = true;

  // Fire-and-forget imports so Vite can fetch the chunks early.
  void import('../routes/Dashboard');
  void import('../routes/Explorer');
  void import('../routes/TemplateMarketplace');
  void import('../routes/Insights');
}

