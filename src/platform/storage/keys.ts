export const STORAGE_PREFIX = 'explorer';

export const STORAGE_KEYS = {
  theme: `${STORAGE_PREFIX}:theme`,
  onboardingDismissed: `${STORAGE_PREFIX}:onboarding:dismissed`,
  authReturnTo: `${STORAGE_PREFIX}:auth:return-to`,
  recentFolders: `${STORAGE_PREFIX}:cmdk:recent-folders`,
  recentApps: `${STORAGE_PREFIX}:cmdk:recent-apps`,
  contextApps: `${STORAGE_PREFIX}:context:apps`,
  contextFolders: `${STORAGE_PREFIX}:context:folders`,
  userTemplates: `${STORAGE_PREFIX}:templates:user`,
  experiments: `${STORAGE_PREFIX}:experiments`,
} as const;

export const APP_LOCAL_STORAGE_KEYS = [
  STORAGE_KEYS.theme,
  STORAGE_KEYS.onboardingDismissed,
  STORAGE_KEYS.recentFolders,
  STORAGE_KEYS.recentApps,
  STORAGE_KEYS.contextApps,
  STORAGE_KEYS.contextFolders,
  STORAGE_KEYS.userTemplates,
  STORAGE_KEYS.experiments,
] as const;

export const APP_SESSION_STORAGE_KEYS = [STORAGE_KEYS.authReturnTo] as const;
