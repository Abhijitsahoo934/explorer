import { captureError, captureMessage } from './monitoring';

export const logger = {
  error(scope: string, error: unknown, extra?: Record<string, unknown>) {
    captureError(error, { tags: { scope }, extra });
    if (import.meta.env.DEV) {
      console.error(`[${scope}]`, error, extra);
    }
  },
  warn(scope: string, message: string, extra?: Record<string, unknown>) {
    captureMessage(message, { tags: { scope }, extra });
    if (import.meta.env.DEV) {
      console.warn(`[${scope}]`, message, extra);
    }
  },
};
