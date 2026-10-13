import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { OrderConfirmationView } from '@/components/order/confirmation-view';
import { getServerOrderById } from '@/lib/store/orders';

export const dynamic = 'force-dynamic';

interface OrderConfirmationPageProps {
    params: {
        'order-id': string;
    };
}

export function generateMetadata({ params }: OrderConfirmationPageProps): Metadata {
    return {
        title: `Order ${params['order-id']} Confirmation`,
        description: `Order ${params['order-id']} has been received by Good Fills. View your confirmation and check the latest order details and delivery status.`,
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
    const orderId = params['order-id'];

    try {
        const order = await getServerOrderById(orderId);
        if (
            order &&
            [order.orderStatus, order.paymentStatus, order.shipmentStatus]
                .some((status) => String(status || '').trim().toLowerCase() === 'failed')
        ) {
            redirect('/');
        }
    } catch (error) {
        // Next's redirect is implemented as a thrown control-flow signal; rethrow it.
        if (error && typeof error === 'object' && 'digest' in error) throw error;
        console.error('Could not verify order status for confirmation page:', error);
    }

    return <OrderConfirmationView orderId={orderId} />;
}