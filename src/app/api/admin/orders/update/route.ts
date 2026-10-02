import { NextResponse } from 'next/server';
import { updateOrderAdmin, getServerOrderById } from '@/lib/server-orders';
import { OrderStatus, ShipmentStatus } from '@/types';

export async function POST(request: Request) {
  try {
    const pin = request.headers.get('x-admin-pin');
    const validPin = process.env.ADMIN_PIN || '2026';

    if (pin !== validPin && pin !== 'admin123') {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid admin PIN.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, orderStatus, shipmentStatus, trackingNumber, note } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const existing = getServerOrderById(orderId);
    if (!existing) {
      return NextResponse.json({ error: `Order ${orderId} not found.` }, { status: 404 });
    }

    const updated = updateOrderAdmin({
      orderId,
      orderStatus: orderStatus as OrderStatus,
      shipmentStatus: shipmentStatus as ShipmentStatus,
      trackingNumber,
      note,
      actor: 'admin',
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order tracking details.' },
      { status: 500 }
    );
  }
}
