import { NextResponse } from 'next/server';
import { manageCustomerAddress } from '@/lib/store/customers';
import { getSupabaseUser } from '@/lib/store/users';

export async function POST(request: Request) {
    try {
        const user = await getSupabaseUser();
        if (!user) return NextResponse.json({ error: 'Account authentication required.' }, { status: 401 });

        const body = await request.json();
        const { action = 'add', address, addressIndex } = body;

        if (action === 'add' || action === 'edit') {
            if (!address?.addressLine1 || !address?.city || !address?.pincode) {
                return NextResponse.json(
                    { error: 'Street address, city, and pincode are required.' },
                    { status: 400 }
                );
            }
        }

        const updatedUser = await manageCustomerAddress(user.id, action, address, addressIndex);
        if (!updatedUser) {
            return NextResponse.json(
                { error: 'Customer profile not found.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Address ${action === 'delete' ? 'deleted' : action === 'setDefault' ? 'set as default' : 'saved'} successfully.`,
            user: updatedUser,
        });
    } catch (error: any) {
        console.error('Error in address route:', error);
        return NextResponse.json(
            { error: error.message || 'Server error while managing address.' },
            { status: 500 }
        );
    }
}