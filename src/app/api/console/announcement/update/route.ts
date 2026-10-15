import { NextResponse } from 'next/server';
import { updateAnnouncementConfig } from '@/lib/store/announcement';
import { requireConsoleSession } from '@/lib/admin/session';

export async function POST(request: Request) {
  const authError = requireConsoleSession();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { enabled, image_url, title, link_url, show_button, button_text, show_once } = body;

    const updates: Record<string, any> = {};
    if (typeof enabled === 'boolean') updates.enabled = enabled;
    if (typeof image_url === 'string') updates.image_url = image_url.trim();
    if (typeof title === 'string') updates.title = title.trim();
    if (typeof link_url === 'string') updates.link_url = link_url.trim();
    if (typeof show_button === 'boolean') updates.show_button = show_button;
    if (typeof button_text === 'string') updates.button_text = button_text.trim();
    if (typeof show_once === 'boolean') updates.show_once = show_once;

    const updated = await updateAnnouncementConfig(updates);
    return NextResponse.json({ success: true, config: updated });
  } catch (error: any) {
    console.error('Error in console announcement POST:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update announcement configuration.' },
      { status: 500 }
    );
  }
}