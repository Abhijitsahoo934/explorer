import { useCallback } from 'react';
import {
  getTopContextItems,
  recordAppUsage,
  recordFolderUsage,
  type TopContextItems,
} from '../lib/contextEngine';

export function useContextMemory() {
  const trackAppUsage = useCallback((appId: string) => {
    recordAppUsage(appId);
  }, []);

  const trackFolderUsage = useCallback((folderId: string | null) => {
    if (!folderId) return;
    recordFolderUsage(folderId);
  }, []);

  const readTopContext = useCallback((limit?: number): TopContextItems => {
    return getTopContextItems(limit);
  }, []);

  return {
    trackAppUsage,
    trackFolderUsage,
    readTopContext,
  };
}
