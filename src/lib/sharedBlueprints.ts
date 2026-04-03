import { supabase } from './supabase';
import type { WorkspaceTemplate } from './explorerService';

export interface SharedBlueprintRow {
  public_id: string;
  name: string;
  payload: WorkspaceTemplate;
  created_at: string;
}

function generatePublicId() {
  const randomPart =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 10)
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

  return `bp_${randomPart}`;
}

export async function createSharedBlueprint(payload: WorkspaceTemplate): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Authentication required to share a blueprint.');
  }

  const publicId = generatePublicId();
  const { error } = await supabase.from('shared_blueprints').insert([
    {
      public_id: publicId,
      owner_user_id: user.id,
      name: payload.name,
      payload,
    },
  ]);

  if (error) {
    throw error;
  }

  return publicId;
}

export async function fetchSharedBlueprint(publicId: string): Promise<WorkspaceTemplate | null> {
  const { data, error } = await supabase
    .from('shared_blueprints')
    .select('payload')
    .eq('public_id', publicId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data?.payload as WorkspaceTemplate | undefined) ?? null;
}
