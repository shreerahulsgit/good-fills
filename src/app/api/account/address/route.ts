import { NextResponse } from 'next/server';
import { manageCustomerAddress } from '@/lib/server-customer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, action = 'add', address, addressIndex } = body;

    if (!identifier) {
      return NextResponse.json(
        { error: 'Customer identifier is required.' },
        { status: 400 }
      );
    }

    if (action === 'add' || action === 'edit') {
      if (!address?.addressLine1 || !address?.city || !address?.pincode) {
        return NextResponse.json(
          { error: 'Street address, city, and pincode are required.' },
          { status: 400 }
        );
      }
    }

    const updatedUser = manageCustomerAddress(identifier, action, address, addressIndex);
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
