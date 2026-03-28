/**
 * Core database entities — matches Supabase `folders` + `apps`.
 */
export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  user_id: string;
  created_at: string;
}

/** Workspace app (tool in your OS), not a passive bookmark row */
export interface App {
  id: string;
  name: string;
  url: string;
  icon: string | null;
  description: string | null;
  folder_id: string | null;
  user_id: string;
  created_at: string;
  last_opened_at: string | null;
  is_pinned: boolean;
}

/** @deprecated Use App — kept for gradual migration */
export type Website = App;

export type ItemType = 'folder' | 'app';

export interface ExplorerItem {
  id: string;
  name: string;
  type: ItemType;
  url?: string;
  parentId: string | null;
  userId: string;
  createdAt: string;
  isOpen?: boolean;
}

export interface FolderNode extends Folder {
  children: FolderNode[];
  apps: App[];
  isOpen?: boolean;
}

export interface ExplorerState {
  currentFolderId: string | null;
  folders: Folder[];
  apps: App[];
  loading: boolean;
  error: string | null;
}
