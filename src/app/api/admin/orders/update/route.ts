import { NextResponse } from 'next/server';
import { updateOrderAdmin, getServerOrderById } from '@/lib/supabase-orders';
import { OrderStatus, ShipmentStatus } from '@/types';
import { requireConsoleSession } from '@/lib/require-console-session';

export async function POST(request: Request) {
  try {
    const authError = requireConsoleSession();
    if (authError) return authError;

    const body = await request.json();
    const { orderId, orderStatus, shipmentStatus, trackingNumber, note } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const existing = await getServerOrderById(orderId);
    if (!existing) {
      return NextResponse.json({ error: `Order ${orderId} not found.` }, { status: 404 });
    }

    const updated = await updateOrderAdmin({
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
