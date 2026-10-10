import { NextResponse } from 'next/server';
import { deleteInquiry } from '@/lib/store/inquiries';
import { requireConsoleSession } from '@/lib/admin/session';

export const dynamic = 'force-dynamic';

export async function DELETE(request: Request) {
    try {
        const authError = requireConsoleSession();
        if (authError) return authError;

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Inquiry ID is required' }, { status: 400 });
        }

        await deleteInquiry(id);
        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error deleting inquiry:', error);
        return NextResponse.json({ error: 'Failed to delete inquiry' }, { status: 500 });
    }
}