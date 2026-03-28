import { supabase } from './supabase';
import type { Folder, App } from '../types/explorer';
import { normalizeExternalUrl } from '../platform/security/url';

export type SearchResult = App & { folders: { name: string } | null };

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
    const query = supabase.from('apps').select('*');
    if (folderId) query.eq('folder_id', folderId);
    else query.is('folder_id', null);

    const { data, error } = await query.order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []) as App[];
  },

  async getAllApps(): Promise<App[]> {
    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []) as App[];
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

    const { data, error } = await supabase
      .from('apps')
      .insert([
        {
          name,
          url: safeUrl,
          folder_id: folderId,
          user_id: user.id,
          icon: null,
          description: null,
          last_opened_at: null,
          is_pinned: false,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    return data as App;
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

      const { data: existingApps, error: existingAppsError } = await supabase
        .from('apps')
        .select('id, url')
        .eq('user_id', user.id)
        .eq('folder_id', folderId);

      if (existingAppsError) throw existingAppsError;

      const existingUrlSet = new Set((existingApps || []).map((w) => w.url));
      const appsPayload = appsInTemplate
        .filter((website) => website.url && !existingUrlSet.has(website.url))
        .map((website) => ({
          name: website.name,
          url: website.url,
          folder_id: folderId,
          user_id: user.id,
          icon: null,
          description: null,
          last_opened_at: null,
          is_pinned: false,
        }));

      if (appsPayload.length === 0) continue;

      const { error: appsError } = await supabase.from('apps').insert(appsPayload);

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

    const { data, error } = await supabase
      .from('apps')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as App;
  },

  async setAppPinned(id: string, isPinned: boolean): Promise<void> {
    const { error } = await supabase.from('apps').update({ is_pinned: isPinned }).eq('id', id);
    if (error) throw error;
  },

  async recordAppOpened(id: string): Promise<void> {
    const { error } = await supabase
      .from('apps')
      .update({ last_opened_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  async moveApp(id: string, newFolderId: string | null): Promise<void> {
    const { error } = await supabase
      .from('apps')
      .update({ folder_id: newFolderId })
      .eq('id', id);
    if (error) throw error;
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
    const { error } = await supabase
      .from('apps')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async searchApps(query: string): Promise<SearchResult[]> {
    const { data, error } = await supabase
      .from('apps')
      .select('*, folders(name)')
      .ilike('name', `%${query}%`)
      .limit(10);
    if (error) throw error;
    return data as unknown as SearchResult[];
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
      .subscribe();
  },
};
