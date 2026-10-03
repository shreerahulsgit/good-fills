import fs from 'fs';
import path from 'path';

export interface Inquiry {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email?: string;
  category: string;
  orderId?: string;
  message: string;
  status: 'new' | 'replied' | 'archived';
}

const DATA_DIR = path.join(process.cwd(), '.data');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');

const SEED_INQUIRIES: Inquiry[] = [
  {
    id: 'INQ-4821',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    name: 'Kavya Ramesh',
    phone: '+91 98450 11223',
    email: 'kavya.ramesh@gmail.com',
    category: 'Infant Nutrition & Weaning',
    orderId: 'ORD-5658',
    message: 'Can I request baby cereal mix ground slightly finer for a 6-month-old infant? We are introducing solids this week.',
    status: 'new',
  },
  {
    id: 'INQ-3914',
    createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    name: 'Ananya Deshmukh',
    phone: '+91 97110 44556',
    email: 'ananya.d@outlook.com',
    category: 'Custom Milling Request',
    message: 'Looking to order 15 boxes of Sprouted Ragi Porridge and Kids Herbal Bath powder as traditional baby shower gifts.',
    status: 'new',
  },
  {
    id: 'INQ-2109',
    createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    name: 'Rajesh Subramanian',
    phone: '+91 94432 78901',
    email: 'rajesh.sub@yahoo.co.in',
    category: 'Order Status & DTDC Courier',
    orderId: 'ORD-3595',
    message: 'Inquiring about delivery ETA in Chennai for our postpartum ubtan batch. Kindly share DTDC tracking update.',
    status: 'replied',
  },
];

let inquiriesCache: Inquiry[] | null = null;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // Ignore
    }
  }
}

function loadInquiries(): Inquiry[] {
  if (inquiriesCache !== null) {
    return inquiriesCache;
  }

  ensureDataDir();

  try {
    if (fs.existsSync(INQUIRIES_FILE)) {
      const raw = fs.readFileSync(INQUIRIES_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inquiriesCache = parsed;
        return inquiriesCache;
      }
    }
  } catch (err) {
    console.error('Error loading inquiries from disk:', err);
  }

  // Seed default inquiries
  inquiriesCache = [...SEED_INQUIRIES];
  persistInquiries(inquiriesCache);
  return inquiriesCache;
}

function persistInquiries(list: Inquiry[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving inquiries to disk:', err);
  }
}

export function getAllInquiries(): Inquiry[] {
  const list = loadInquiries();
  // Return newest first
  return [...list].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function createInquiry(data: {
  name: string;
  phone: string;
  email?: string;
  category: string;
  orderId?: string;
  message: string;
}): Inquiry {
  const list = loadInquiries();
  const newInq: Inquiry = {
    id: `INQ-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
    name: data.name.trim(),
    phone: data.phone.trim(),
    email: data.email?.trim() || undefined,
    category: data.category || 'General Inquiry',
    orderId: data.orderId?.trim() || undefined,
    message: data.message.trim(),
    status: 'new',
  };

  list.unshift(newInq);
  inquiriesCache = list;
  persistInquiries(list);
  return newInq;
}

export function updateInquiryStatus(id: string, status: Inquiry['status']): boolean {
  const list = loadInquiries();
  const item = list.find((i) => i.id === id);
  if (!item) return false;
  item.status = status;
  inquiriesCache = list;
  persistInquiries(list);
  return true;
}
