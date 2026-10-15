import { NextResponse } from 'next/server';
import { getAnnouncementConfig, updateAnnouncementConfig } from '@/lib/store/announcement';
import { requireConsoleSession } from '@/lib/admin/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authError = requireConsoleSession();
  if (authError) return authError;

  try {
    const config = await getAnnouncementConfig();
    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    console.error('Error in console announcement GET:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load announcement configuration.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const authError = requireConsoleSession();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { enabled, imageUrl, title, linkUrl, showButton, buttonText, showOncePerSession } = body;

    const updates: Record<string, any> = {};
    if (typeof enabled === 'boolean') updates.enabled = enabled;
    if (typeof imageUrl === 'string') updates.imageUrl = imageUrl.trim();
    if (typeof title === 'string') updates.title = title.trim();
    if (typeof linkUrl === 'string') updates.linkUrl = linkUrl.trim();
    if (typeof showButton === 'boolean') updates.showButton = showButton;
    if (typeof buttonText === 'string') updates.buttonText = buttonText.trim();
    if (typeof showOncePerSession === 'boolean') updates.showOncePerSession = showOncePerSession;

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
