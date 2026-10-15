import { NextResponse } from 'next/server';
import { getAnnouncementConfig } from '@/lib/store/announcement';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await getAnnouncementConfig();
    return NextResponse.json({ success: true, config });
  } catch (error: any) {
    console.error('Error fetching announcement config:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch announcement configuration.' },
      { status: 500 }
    );
  }
}
