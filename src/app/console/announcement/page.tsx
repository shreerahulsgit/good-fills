import type { Metadata } from 'next';
import { AdminDispatchView } from '@/components/console/dispatch-view';

export const metadata: Metadata = {
  title: 'Announcement Posters',
  description: 'Manage storefront announcement modals, festival notices, and custom promotional posters.',
};

export default function ConsoleAnnouncementPage() {
  return <AdminDispatchView initialTab="announcement" />;
}
