import fs from 'fs';
import path from 'path';
import os from 'os';
import { CustomerUser, Order, ShippingAddress } from '@/types';
import { getAllServerOrders } from '@/lib/server-orders';

const PRIMARY_DATA_DIR = path.join(process.cwd(), '.data');
const PRIMARY_ORDERS_FILE = path.join(PRIMARY_DATA_DIR, 'server-orders.json');
const PRIMARY_CUSTOMERS_FILE = path.join(PRIMARY_DATA_DIR, 'customers.json');

const TMP_DATA_DIR = path.join(os.tmpdir(), 'good-fills-data');
const TMP_ORDERS_FILE = path.join(TMP_DATA_DIR, 'server-orders.json');
const TMP_CUSTOMERS_FILE = path.join(TMP_DATA_DIR, 'customers.json');

function ensureDataDirs() {
  if (!fs.existsSync(PRIMARY_DATA_DIR)) {
    try {
      fs.mkdirSync(PRIMARY_DATA_DIR, { recursive: true });
    } catch {}
  }
  if (!fs.existsSync(TMP_DATA_DIR)) {
    try {
      fs.mkdirSync(TMP_DATA_DIR, { recursive: true });
    } catch {}
  }
}

function loadOrders(): Order[] {
  try {
    const list = getAllServerOrders();
    if (Array.isArray(list) && list.length > 0) return list;
  } catch {}

  const ordersMap = new Map<string, Order>();
  try {
    if (fs.existsSync(PRIMARY_ORDERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(PRIMARY_ORDERS_FILE, 'utf8'));
      if (Array.isArray(data)) data.forEach((o: Order) => ordersMap.set(o.id, o));
    }
  } catch {}

  try {
    if (fs.existsSync(TMP_ORDERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(TMP_ORDERS_FILE, 'utf8'));
      if (Array.isArray(data)) data.forEach((o: Order) => ordersMap.set(o.id, o));
    }
  } catch {}

  return Array.from(ordersMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function loadCustomers(): Record<string, CustomerUser> {
  const map: Record<string, CustomerUser> = {};
  try {
    if (fs.existsSync(PRIMARY_CUSTOMERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(PRIMARY_CUSTOMERS_FILE, 'utf8'));
      if (data && typeof data === 'object') Object.assign(map, data);
    }
  } catch {}

  try {
    if (fs.existsSync(TMP_CUSTOMERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(TMP_CUSTOMERS_FILE, 'utf8'));
      if (data && typeof data === 'object') Object.assign(map, data);
    }
  } catch {}

  return map;
}

function saveCustomers(customers: Record<string, CustomerUser>) {
  const serialized = JSON.stringify(customers, null, 2);
  ensureDataDirs();
  try {
    fs.writeFileSync(PRIMARY_CUSTOMERS_FILE, serialized, 'utf8');
  } catch {}
  try {
    fs.writeFileSync(TMP_CUSTOMERS_FILE, serialized, 'utf8');
  } catch {}
}

export function clearAllCustomers(): void {
  saveCustomers({});
}

/**
 * Finds all orders matching either email or 10-digit mobile phone number
 */
export function findCustomerOrders(allOrders: Order[], email?: string, phone?: string): Order[] {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);

  return allOrders
    .filter((o) => {
      const oEmail = (o.customerEmail || o.shippingAddress?.email || '').trim().toLowerCase();
      if (cleanEmail && oEmail && oEmail === cleanEmail) {
        return true;
      }
      const oPhone = (o.customerPhone || o.shippingAddress?.phone || '').replace(/\D/g, '').slice(-10);
      if (cleanPhone && cleanPhone.length >= 8 && oPhone && oPhone.length >= 8) {
        if (oPhone.endsWith(cleanPhone) || cleanPhone.endsWith(oPhone)) {
          return true;
        }
      }
      return false;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Retrieves a customer profile by email, phone number, or user ID, along with their past orders.
 */
export function getCustomerProfile(identifier: string): { user: CustomerUser; orders: Order[] } | null {
  const clean = identifier.trim().toLowerCase();
  if (!clean) return null;

  const allOrders = loadOrders();
  const savedCustomers = loadCustomers();

  const isEmail = clean.includes('@');
  const cleanPhone = clean.replace(/\D/g, '').slice(-10);

  // 1. Check saved customer file by email key, phone key, or direct property match
  let user: CustomerUser | undefined =
    savedCustomers[`email_${clean}`] ||
    savedCustomers[`phone_${cleanPhone}`] ||
    Object.values(savedCustomers).find(
      (u) =>
        (u.email && u.email.toLowerCase() === clean) ||
        (cleanPhone.length >= 8 && u.phone && u.phone.replace(/\D/g, '').endsWith(cleanPhone)) ||
        u.id === clean
    );

  // 2. Fetch all matching orders by email or phone
  const searchEmail = isEmail ? clean : user?.email;
  const searchPhone = cleanPhone.length >= 8 ? cleanPhone : user?.phone;
  const customerOrders = findCustomerOrders(allOrders, searchEmail, searchPhone);

  // 3. Synthesize customer profile from previous orders if not explicitly registered
  if (!user && customerOrders.length > 0) {
    const latestOrder = customerOrders[0];
    const addresses: ShippingAddress[] = [];

    customerOrders.forEach((o) => {
      if (o.shippingAddress && o.shippingAddress.addressLine1) {
        const isDuplicate = addresses.some(
          (a) => a.addressLine1 === o.shippingAddress.addressLine1 && a.pincode === o.shippingAddress.pincode
        );
        if (!isDuplicate) {
          addresses.push(o.shippingAddress);
        }
      }
    });

    user = {
      id: latestOrder.customerId || `CUST-${Date.now().toString().slice(-6)}`,
      name: latestOrder.customerName || 'Good Fills Customer',
      email: latestOrder.customerEmail || (isEmail ? clean : ''),
      phone: latestOrder.customerPhone || cleanPhone,
      role: 'customer',
      addresses,
      createdAt: customerOrders[customerOrders.length - 1].createdAt || new Date().toISOString(),
    };

    const customerKey = isEmail ? `email_${clean}` : `phone_${cleanPhone}`;
    savedCustomers[customerKey] = user;
    saveCustomers(savedCustomers);
  }

  if (!user) return null;

  // 4. Enrich missing phone/email if found from orders
  if (customerOrders.length > 0) {
    let changed = false;
    if (!user.phone && customerOrders[0].customerPhone) {
      user.phone = customerOrders[0].customerPhone;
      changed = true;
    }
    if (!user.email && customerOrders[0].customerEmail) {
      user.email = customerOrders[0].customerEmail;
      changed = true;
    }
    if (changed) {
      const key = user.email ? `email_${user.email.toLowerCase()}` : `phone_${user.phone.replace(/\D/g, '').slice(-10)}`;
      savedCustomers[key] = user;
      saveCustomers(savedCustomers);
    }
  }

  return {
    user,
    orders: customerOrders,
  };
}

/**
 * Updates customer profile information (Name, Email, Phone)
 */
export function updateCustomerProfile(
  identifier: string,
  updates: { name?: string; email?: string; phone?: string }
): CustomerUser | null {
  const profile = getCustomerProfile(identifier);
  if (!profile) return null;

  const clean = identifier.trim().toLowerCase();
  const customerKey = `email_${clean}`;

  const savedCustomers = loadCustomers();
  let user = savedCustomers[customerKey] || profile.user;

  if (updates.name && updates.name.trim()) {
    user.name = updates.name.trim();
  }
  if (updates.email && updates.email.trim()) {
    user.email = updates.email.trim().toLowerCase();
  }
  if (updates.phone !== undefined) {
    user.phone = updates.phone.trim();
  }

  savedCustomers[customerKey] = user;
  saveCustomers(savedCustomers);
  return user;
}

/**
 * Manages customer shipping addresses: add, edit, delete, or setDefault
 */
export function manageCustomerAddress(
  identifier: string,
  action: 'add' | 'edit' | 'delete' | 'setDefault',
  address?: ShippingAddress,
  addressIndex?: number
): CustomerUser | null {
  const profile = getCustomerProfile(identifier);
  if (!profile) return null;

  const clean = identifier.trim().toLowerCase();
  const customerKey = `email_${clean}`;

  const savedCustomers = loadCustomers();
  let user = savedCustomers[customerKey] || profile.user;
  user.addresses = user.addresses || [];

  if (action === 'add' && address) {
    user.addresses.unshift(address);
  } else if (action === 'edit' && address && addressIndex !== undefined && addressIndex >= 0) {
    if (addressIndex < user.addresses.length) {
      user.addresses[addressIndex] = address;
    }
  } else if (action === 'delete' && addressIndex !== undefined && addressIndex >= 0) {
    if (addressIndex < user.addresses.length) {
      user.addresses.splice(addressIndex, 1);
    }
  } else if (action === 'setDefault' && addressIndex !== undefined && addressIndex >= 0) {
    if (addressIndex < user.addresses.length) {
      const selected = user.addresses.splice(addressIndex, 1)[0];
      user.addresses.unshift(selected);
    }
  }

  savedCustomers[customerKey] = user;
  saveCustomers(savedCustomers);
  return user;
}

/**
 * Handles seamless 1-click Google authentication
 */
export function loginOrRegisterWithGoogle(googleData: {
  email: string;
  name?: string;
  photoUrl?: string;
}): { user: CustomerUser; orders: Order[] } | null {
  const email = (googleData.email || '').trim().toLowerCase();
  if (!email || !email.includes('@')) return null;

  const allOrders = loadOrders();
  const savedCustomers = loadCustomers();

  const customerKey = `email_${email}`;
  let user = savedCustomers[customerKey];

  const customerOrders = findCustomerOrders(allOrders, email, user?.phone);

  if (!user && customerOrders.length > 0) {
    const latestOrder = customerOrders[0];
    const addresses: ShippingAddress[] = [];
    customerOrders.forEach((o) => {
      if (o.shippingAddress && o.shippingAddress.addressLine1) {
        const isDuplicate = addresses.some(
          (a) => a.addressLine1 === o.shippingAddress.addressLine1 && a.pincode === o.shippingAddress.pincode
        );
        if (!isDuplicate) addresses.push(o.shippingAddress);
      }
    });

    user = {
      id: latestOrder.customerId || `CUST-${Date.now().toString().slice(-6)}`,
      name: googleData.name || latestOrder.customerName || 'Good Fills Customer',
      email,
      phone: latestOrder.customerPhone || '',
      role: 'customer',
      addresses,
      createdAt: customerOrders[customerOrders.length - 1].createdAt || new Date().toISOString(),
    };
    savedCustomers[customerKey] = user;
    saveCustomers(savedCustomers);
  } else if (!user) {
    user = {
      id: `CUST-${Date.now().toString().slice(-6)}`,
      name: googleData.name || 'Good Fills Customer',
      email,
      phone: '',
      role: 'customer',
      addresses: [],
      createdAt: new Date().toISOString(),
    };
    savedCustomers[customerKey] = user;
    saveCustomers(savedCustomers);
  } else {
    if (googleData.name && (!user.name || user.name === 'Good Fills Customer' || user.name === 'New Customer')) {
      user.name = googleData.name;
      savedCustomers[customerKey] = user;
      saveCustomers(savedCustomers);
    }
  }

  return { user, orders: customerOrders };
}

export const loginOrRegisterCustomer = loginOrRegisterWithGoogle;
