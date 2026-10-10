import { NextResponse } from 'next/server';
import { createInquiry } from '@/lib/store/inquiries';

export const dynamic = 'force-dynamic';

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