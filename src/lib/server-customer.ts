import fs from 'fs';
import path from 'path';
import { CustomerUser, Order, ShippingAddress } from '@/types';

const DATA_DIR = path.join(process.cwd(), '.data');
const ORDERS_FILE = path.join(DATA_DIR, 'server-orders.json');
const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // Ignore in read-only environments
    }
  }
}

function loadOrders(): Order[] {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.error('Error loading orders in server-customer:', err);
  }
  return [];
}

function loadCustomers(): Record<string, CustomerUser> {
  try {
    if (fs.existsSync(CUSTOMERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(CUSTOMERS_FILE, 'utf8'));
      if (data && typeof data === 'object') return data;
    }
  } catch (err) {
    console.error('Error loading customers:', err);
  }
  return {};
}

function saveCustomers(customers: Record<string, CustomerUser>) {
  try {
    ensureDataDir();
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(customers, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving customers:', err);
  }
}

export function clearAllCustomers(): void {
  saveCustomers({});
}

/**
 * Retrieves a customer profile by email or user ID, along with their past orders.
 */
export function getCustomerProfile(identifier: string): { user: CustomerUser; orders: Order[] } | null {
  const clean = identifier.trim().toLowerCase();
  if (!clean) return null;

  const allOrders = loadOrders();
  const savedCustomers = loadCustomers();

  // Find all orders matching this email
  const customerOrders = allOrders
    .filter((o) => (o.customerEmail || '').toLowerCase() === clean)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Check saved customer file by email key or direct match
  const customerKey = `email_${clean}`;
  let user = savedCustomers[customerKey] || Object.values(savedCustomers).find((u) => u.email?.toLowerCase() === clean);

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
      email: latestOrder.customerEmail || clean,
      phone: latestOrder.customerPhone || '',
      role: 'customer',
      addresses,
      createdAt: customerOrders[customerOrders.length - 1].createdAt || new Date().toISOString(),
    };

    savedCustomers[customerKey] = user;
    saveCustomers(savedCustomers);
  }

  if (!user) return null;

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

  const customerOrders = allOrders
    .filter((o) => (o.customerEmail || '').toLowerCase() === email)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const customerKey = `email_${email}`;
  let user = savedCustomers[customerKey];

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
