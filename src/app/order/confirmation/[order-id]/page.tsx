import type { Metadata } from 'next';
import { OrderConfirmationView } from '@/components/order/confirmation-view';

interface OrderConfirmationPageProps {
    params: {
        orderId: string;
    };
}

export function generateMetadata({ params }: OrderConfirmationPageProps): Metadata {
    return {
        title: `Order ${params.orderId} Confirmed • Good Fills Atelier`,
        description:
        'Your Good Fills handcrafted made-to-order preparation is confirmed. Fresh traditional care dispatched with fast, tracked doorstep delivery.',
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
    return <OrderConfirmationView orderId={params.orderId} />;
}