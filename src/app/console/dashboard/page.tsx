import type { Metadata } from 'next';
import { AdminDispatchView } from '@/components/admin/AdminDispatchView';

export const metadata: Metadata = {
  title: 'Overview Dashboard • Good Fills Console',
  description: 'Real-time sales analytics, revenue metrics, and performance overview for Good Fills Atelier.',
};

export default function ConsoleDashboardPage() {
  return <AdminDispatchView initialTab="dashboard" />;
}
