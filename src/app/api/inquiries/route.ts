import { NextResponse } from 'next/server';
import { getAllInquiries } from '@/lib/store/inquiries';
import { requireConsoleSession } from '@/lib/admin/session';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const authError = requireConsoleSession();
        if (authError) return authError;

        const inquiries = await getAllInquiries();
        return NextResponse.json({ success: true, inquiries });
    } catch (error) {
        console.error('Error fetching inquiries:', error);
        return NextResponse.json({ error: 'Failed to retrieve inquiries' }, { status: 500 });
    }
}