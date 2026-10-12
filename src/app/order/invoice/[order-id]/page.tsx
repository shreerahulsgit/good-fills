import React from 'react';
import { Metadata } from 'next';
import { InvoiceDocumentView } from '@/components/order/invoice-view';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
    params,
}: {
    params: { 'order-id': string };
}): Promise<Metadata> {
    const orderId = params?.['order-id'] || 'Order';
    return {
        title: `Invoice for Order ${orderId}`,
        description: `View or print the invoice for Good Fills order ${orderId}, including the recorded order and payment details.`,
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default function DirectInvoicePage({
    params,
}: {
    params: { 'order-id': string };
}) {
    return <InvoiceDocumentView orderId={params['order-id']} />;
}