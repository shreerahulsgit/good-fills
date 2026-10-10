import { NextResponse } from 'next/server';
import { updateCustomerProfile } from '@/lib/store/customers';
import { getSupabaseUser } from '@/lib/store/users';

export async function POST(request: Request) {
    try {
        const user = await getSupabaseUser();
        if (!user) return NextResponse.json({ error: 'Account authentication required.' }, { status: 401 });

        const body = await request.json();
        const { name, email, phone } = body;

        if (!name && !email && phone === undefined) {
            return NextResponse.json(
                { error: 'Please provide a name or email to update.' },
                { status: 400 }
            );
        }

        const updated = await updateCustomerProfile(user.id, { name, email, phone });
        if (!updated) {
            return NextResponse.json(
                { error: 'Customer profile not found.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully.',
            user: updated,
        });
    } catch (error: any) {
        console.error('Update profile error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update profile.' },
            { status: 500 }
        );
    }
}