import type { Metadata } from 'next';
import { AdminDispatchView } from '@/components/admin/AdminDispatchView';

export const metadata: Metadata = {
  title: 'Inquiries & Concierge Desk • Good Fills Console',
  description: 'Review customer inquiries, contact requests, and custom batch messages.',
};

export default function ConsoleInquiriesPage() {
  return <AdminDispatchView initialTab="inquiries" />;
}
