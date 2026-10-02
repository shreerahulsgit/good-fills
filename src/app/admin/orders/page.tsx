import type { Metadata } from 'next';
import { AdminDispatchView } from '@/components/admin/AdminDispatchView';

export const metadata: Metadata = {
  title: 'Kitchen Dispatch Console • Good Fills Admin',
  description: 'Manage Good Fills orders, processing batches, sales analytics, and DTDC consignment fulfillment.',
};

export default function AdminOrdersPage() {
  return <AdminDispatchView />;
}
