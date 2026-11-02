export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const KITCHEN_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Why does Good Fills have strict No Return policy?',
    answer:
      'Because every food, infant nutrition, and skincare creation is prepared fresh to order using 100% natural ingredients without artificial preservatives, items cannot be restocked or resold once dispatched. In compliance with FSSAI hygiene standards, all sales are final.',
  },
  {
    id: 'faq-2',
    question: 'What if my parcel arrives damaged or seal tampered?',
    answer:
      'We offer a 100% Transit Safety Guarantee. If your package arrives crushed, punctured, or leaking, take clear photos or video of the box and courier label, and message our WhatsApp concierge with your Order ID within 24 hours. We will promptly dispatch a free replacement or initiate a refund.',
  },
  {
    id: 'faq-3',
    question: 'Can I cancel or modify my order after payment?',
    answer:
      'Because traditional soaking, sprouting, and milling are queued specifically for your batch shortly after checkout, cancellations are only possible if requested before kitchen preparation begins. Once grinding or dispatch is underway, orders cannot be cancelled.',
  },
  {
    id: 'faq-4',
    question: 'How do I track my order & DTDC express courier delivery?',
    answer:
      'You can track your package anytime directly on our live tracking page using your Order ID (e.g. ORD-7776) or registered 10-digit mobile number. You will also receive real-time SMS and WhatsApp notifications with your DTDC AWB number upon dispatch.',
  },
];

