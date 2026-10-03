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

const SEED_INQUIRIES: Inquiry[] = [];

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
      if (Array.isArray(parsed)) {
        inquiriesCache = parsed;
        return inquiriesCache;
      }
    }
  } catch (err) {
    console.error('Error loading inquiries from disk:', err);
  }

  inquiriesCache = [];
  persistInquiries(inquiriesCache);
  return inquiriesCache;
}

export function clearAllInquiries(): void {
  inquiriesCache = [];
  persistInquiries([]);
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
