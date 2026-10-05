import type { Metadata } from 'next';
import { AdminDispatchView } from '@/components/admin/AdminDispatchView';

export const metadata: Metadata = {
  title: 'Orders Management • Good Fills Console',
  description: 'Manage Good Fills customer orders, 1-click status progression, and consignment fulfillment.',
};

export default function ConsoleOrdersPage() {
  return <AdminDispatchView initialTab="orders" />;
}
