import { NextResponse } from 'next/server';
import { updateInquiryStatus } from '@/lib/store/inquiries';
import { requireConsoleSession } from '@/lib/admin/session';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request) {
    try {
        const authError = requireConsoleSession();
        if (authError) return authError;

        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'ID and status required' }, { status: 400 });
        }

        const updated = await updateInquiryStatus(id, status);
        if (!updated) {
            return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, id, status });
    } catch (error) {
        console.error('Error updating inquiry status:', error);
        return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 });
    }
}