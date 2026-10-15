import { AnnouncementConfig } from '@/types';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const DEFAULT_ANNOUNCEMENT: AnnouncementConfig = {
  id: 'post-0001',
  enabled: false,
  image_url: '/images/announcement-poster.jpg',
  title: 'Your Announcement Title',
  link_url: '',
  show_button: true,
  button_text: 'Continue to Store',
  show_once: true,
  updated_at: new Date().toISOString(),
};

const CONFIG_ID = 'post-0001';

export async function getAnnouncementConfig(): Promise<AnnouncementConfig> {
  const { data, error } = await createSupabaseAdminClient()
    .from('configs')
    .select('*')
    .eq('id', CONFIG_ID)
    .maybeSingle();

  if (error) throw new Error(`Failed to load announcement config from Supabase: ${error.message}`);
  return data ? data as AnnouncementConfig : DEFAULT_ANNOUNCEMENT;
}

export async function updateAnnouncementConfig(updates: Partial<AnnouncementConfig>): Promise<AnnouncementConfig> {
  const current = await getAnnouncementConfig();
  const updated: AnnouncementConfig = {
    ...current,
    ...updates,
    id: CONFIG_ID,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await createSupabaseAdminClient()
    .from('configs')
    .upsert(updated, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) throw new Error(`Failed to save announcement config to Supabase: ${error.message}`);
  return data as AnnouncementConfig;
}
