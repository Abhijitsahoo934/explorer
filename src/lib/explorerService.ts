import { supabase } from './supabase';
import type { Folder, App } from '../types/explorer';
import { normalizeExternalUrl } from '../platform/security/url';

export type SearchResult = App & { folders: { name: string } | null };
type WorkspaceAppsTable = 'apps' | 'websites';

export interface WorkspaceTemplateFolder {
  name: string;
  /** Links in this folder (legacy JSON used `websites`) */
  apps: ReadonlyArray<{
    name: string;
    url: string;
  }>;
}

export interface WorkspaceTemplate {
  name: string;
  folders: ReadonlyArray<WorkspaceTemplateFolder>;
}

function templateApps(folder: WorkspaceTemplateFolder): ReadonlyArray<{ name: string; url: string }> {
  const legacy = folder as unknown as { websites?: typeof folder.apps };
  return folder.apps?.length ? folder.apps : legacy.websites ?? [];
}

let workspaceAppsTablePromise: Promise<WorkspaceAppsTable> | null = null;

function isMissingAppsTableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const maybeError = error as { code?: string; message?: string };
  return (
    maybeError.code === 'PGRST205' ||
    maybeError.message?.includes("Could not find the table 'public.apps'") === true
  );
}

function normalizeAppRecord(record: Record<string, unknown>): App {
  return {
    id: String(record.id ?? ''),
    name: String(record.name ?? ''),
    url: String(record.url ?? ''),
    icon: typeof record.icon === 'string' ? record.icon : null,
    description: typeof record.description === 'string' ? record.description : null,
    folder_id: typeof record.folder_id === 'string' ? record.folder_id : null,
    user_id: String(record.user_id ?? ''),
    created_at: typeof record.created_at === 'string' ? record.created_at : new Date().toISOString(),
    last_opened_at: typeof record.last_opened_at === 'string' ? record.last_opened_at : null,
    is_pinned: typeof record.is_pinned === 'boolean' ? record.is_pinned : false,
  };
}

async function resolveWorkspaceAppsTable(): Promise<WorkspaceAppsTable> {
  if (!workspaceAppsTablePromise) {
    workspaceAppsTablePromise = (async () => {
      const { error } = await supabase.from('apps').select('id', { head: true, count: 'exact' }).limit(1);
      if (!error) return 'apps';
      if (isMissingAppsTableError(error)) return 'websites';
      throw error;
    })();
  }

  return workspaceAppsTablePromise;
}

function resetWorkspaceAppsTableCache() {
  workspaceAppsTablePromise = null;
}

async function withWorkspaceAppsTable<T>(
  run: (table: WorkspaceAppsTable) => Promise<T>,
  options?: { retryOnMissingAppsTable?: boolean }
): Promise<T> {
  const retryOnMissingAppsTable = options?.retryOnMissingAppsTable ?? true;
  const table = await resolveWorkspaceAppsTable();

  try {
    return await run(table);
  } catch (error) {
    if (retryOnMissingAppsTable && table === 'apps' && isMissingAppsTableError(error)) {
      resetWorkspaceAppsTableCache();
      return run('websites');
    }
    throw error;
  }
}

export const explorerService = {
  async getFolders(): Promise<Folder[]> {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async getApps(folderId: string | null): Promise<App[]> {
    return withWorkspaceAppsTable(async (table) => {
      const query = supabase.from(table).select('*');
      if (folderId) query.eq('folder_id', folderId);
      else query.is('folder_id', null);

      const { data, error } = await query.order('created_at', { ascending: true });
      if (error) throw error;
      return ((data || []) as Record<string, unknown>[]).map(normalizeAppRecord);
    });
  },

  async getAllApps(): Promise<App[]> {
    return withWorkspaceAppsTable(async (table) => {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return ((data || []) as Record<string, unknown>[]).map(normalizeAppRecord);
    });
  },

  async createFolder(name: string, parentId: string | null): Promise<Folder> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    const { data, error } = await supabase
      .from('folders')
      .insert([{ name, parent_id: parentId, user_id: user.id }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async addApp(name: string, url: string, folderId: string | null): Promise<App> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    const safeUrl = normalizeExternalUrl(url);
    if (!name.trim()) throw new Error('App name is required.');
    if (!safeUrl) throw new Error('Enter a valid HTTP(S) URL.');

    return withWorkspaceAppsTable(async (table) => {
      const payload =
        table === 'apps'
          ? {
              name,
              url: safeUrl,
              folder_id: folderId,
              user_id: user.id,
              icon: null,
              description: null,
              last_opened_at: null,
              is_pinned: false,
            }
          : {
              name,
              url: safeUrl,
              folder_id: folderId,
              user_id: user.id,
            };

      const { data, error } = await supabase.from(table).insert([payload]).select().single();
      if (error) throw error;
      return normalizeAppRecord((data || {}) as Record<string, unknown>);
    });
  },

  async seedWorkspaceTemplate(template: WorkspaceTemplate): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    const { data: existingFolders, error: existingFoldersError } = await supabase
      .from('folders')
      .select('id, name')
      .eq('user_id', user.id)
      .is('parent_id', null);

    if (existingFoldersError) throw existingFoldersError;

    const folderByName = new Map<string, string>();
    for (const folder of existingFolders || []) {
      if (folder?.name && folder.id) {
        if (!folderByName.has(folder.name)) folderByName.set(folder.name, folder.id);
      }
    }

    for (const folderTemplate of template.folders) {
      const folderName = folderTemplate.name.trim();
      if (!folderName) continue;

      let folderId = folderByName.get(folderName);

      if (!folderId) {
        const { data: insertedFolder, error: folderInsertError } = await supabase
          .from('folders')
          .insert([{ name: folderName, parent_id: null, user_id: user.id }])
          .select('id, name')
          .single();

        if (folderInsertError) throw folderInsertError;
        if (!insertedFolder?.id) throw new Error('Failed to insert folder id.');
        const newFolderId = insertedFolder.id as string;
        folderId = newFolderId;
        folderByName.set(folderName, newFolderId);
      }

      if (!folderId) throw new Error('Resolved folder id is missing.');

      const appsInTemplate = templateApps(folderTemplate);
      if (appsInTemplate.length === 0) continue;

      const table = await resolveWorkspaceAppsTable();
      const { data: existingApps, error: existingAppsError } = await supabase
        .from(table)
        .select('id, url')
        .eq('user_id', user.id)
        .eq('folder_id', folderId);

      if (existingAppsError) throw existingAppsError;

      const existingUrlSet = new Set((existingApps || []).map((w) => w.url));
      const appsPayload = appsInTemplate
        .filter((website) => website.url && !existingUrlSet.has(website.url))
        .map((website) =>
          table === 'apps'
            ? {
                name: website.name,
                url: website.url,
                folder_id: folderId,
                user_id: user.id,
                icon: null,
                description: null,
                last_opened_at: null,
                is_pinned: false,
              }
            : {
                name: website.name,
                url: website.url,
                folder_id: folderId,
                user_id: user.id,
              }
        );

      if (appsPayload.length === 0) continue;

      const { error: appsError } = await supabase.from(table).insert(appsPayload);

      if (appsError) throw appsError;
    }
  },

  async updateFolder(id: string, name: string): Promise<Folder> {
    const { data, error } = await supabase
      .from('folders')
      .update({ name })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateApp(id: string, name: string, url?: string): Promise<App> {
    if (!name.trim()) throw new Error('App name is required.');

    const updateData: { name: string; url?: string } = { name };
    if (url) {
      const safeUrl = normalizeExternalUrl(url);
      if (!safeUrl) throw new Error('Enter a valid HTTP(S) URL.');
      updateData.url = safeUrl;
    }

    return withWorkspaceAppsTable(async (table) => {
      const { data, error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return normalizeAppRecord((data || {}) as Record<string, unknown>);
    });
  },

  async setAppPinned(id: string, isPinned: boolean): Promise<void> {
    await withWorkspaceAppsTable(async (table) => {
      if (table === 'websites') return;
      const { error } = await supabase.from(table).update({ is_pinned: isPinned }).eq('id', id);
      if (error) throw error;
    });
  },

  async recordAppOpened(id: string): Promise<void> {
    await withWorkspaceAppsTable(async (table) => {
      if (table === 'websites') return;
      const { error } = await supabase
        .from(table)
        .update({ last_opened_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    });
  },

  async moveApp(id: string, newFolderId: string | null): Promise<void> {
    await withWorkspaceAppsTable(async (table) => {
      const { error } = await supabase
        .from(table)
        .update({ folder_id: newFolderId })
        .eq('id', id);
      if (error) throw error;
    });
  },

  async moveFolder(id: string, newParentId: string | null): Promise<void> {
    if (id === newParentId) return;
    const { error } = await supabase
      .from('folders')
      .update({ parent_id: newParentId })
      .eq('id', id);
    if (error) throw error;
  },

  async deleteFolder(id: string): Promise<void> {
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async deleteApp(id: string): Promise<void> {
    await withWorkspaceAppsTable(async (table) => {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      if (error) throw error;
    });
  },

  async searchApps(query: string): Promise<SearchResult[]> {
    return withWorkspaceAppsTable(async (table) => {
      const { data, error } = await supabase
        .from(table)
        .select('*, folders(name)')
        .ilike('name', `%${query}%`)
        .limit(10);
      if (error) throw error;
      return ((data || []) as Array<Record<string, unknown> & { folders?: { name: string } | null }>).map((row) => ({
        ...normalizeAppRecord(row),
        folders: row.folders ?? null,
      }));
    });
  },

  /**
   * User-scoped Realtime: folders + apps (Supabase Realtime / WebSocket).
   */
  subscribeToWorkspace(userId: string, callback: () => void) {
    return supabase
      .channel(`workspace_${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'folders', filter: `user_id=eq.${userId}` },
        () => callback()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'apps', filter: `user_id=eq.${userId}` },
        () => callback()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'websites', filter: `user_id=eq.${userId}` },
        () => callback()
      )
      .subscribe();
  },
};
