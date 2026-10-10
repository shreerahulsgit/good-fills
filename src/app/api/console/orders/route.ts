import { NextResponse } from 'next/server';
import { getAllServerOrdersAsync } from '@/lib/store/orders';
import { requireConsoleSession } from '@/lib/admin/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const authError = requireConsoleSession();
        if (authError) return authError;

        const orders = await getAllServerOrdersAsync();
        return NextResponse.json({ success: true, orders });
    } catch (error) {
        console.error('Error fetching admin orders:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve orders.' },
            { status: 500 }
        );
    }
}