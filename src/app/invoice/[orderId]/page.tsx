import React from 'react';
import { Metadata } from 'next';
import { InvoiceDocumentView } from '@/components/invoice/InvoiceDocumentView';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { orderId: string };
}): Promise<Metadata> {
  const orderId = params?.orderId || 'Order';
  return {
    title: `Tax Invoice ${orderId} • Good Fills Atelier`,
    description: `Official Tax Invoice and Cash Receipt for Good Fills Order ${orderId}.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function DirectInvoicePage({
  params,
}: {
  params: { orderId: string };
}) {
  return <InvoiceDocumentView orderId={params.orderId} />;
}
