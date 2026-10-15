import { NextResponse } from 'next/server';
import { getAnnouncementConfig } from '@/lib/store/announcement';
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