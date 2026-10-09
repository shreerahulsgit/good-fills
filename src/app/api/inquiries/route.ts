import { NextResponse } from 'next/server';
import { getAllInquiries, createInquiry, updateInquiryStatus, deleteInquiry } from '@/lib/inquiries';
import { requireConsoleSession } from '@/lib/require-console-session';

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, category, orderId, message } = body;

    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: 'Name, phone number, and message are required.' },
        { status: 400 }
      );
    }

    const inquiry = await createInquiry({
      name,
      phone,
      email,
      category,
      orderId,
      message,
    });

    return NextResponse.json({
      success: true,
      inquiry,
      refNumber: inquiry.id,
      message: 'Inquiry received. Good Fills Atelier will connect shortly.',
    });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 });
  }
}

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

