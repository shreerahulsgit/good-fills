import { NextResponse } from 'next/server';
import { getCustomerProfile } from '@/lib/store/customers';
import { getSupabaseUser } from '@/lib/store/users';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const user = await getSupabaseUser();
        if (!user) return NextResponse.json({ error: 'Account authentication required.' }, { status: 401 });

        const data = await getCustomerProfile(user.id);
        if (!data) {
            return NextResponse.json(
                { error: 'Customer record not found. Please verify your phone number or email.' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, ...data });
    } catch (error) {
        console.error('Error in customer profile route:', error);
        return NextResponse.json(
            { error: 'Failed to load customer profile.' },
            { status: 500 }
        );
    }
}