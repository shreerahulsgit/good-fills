import { CustomerUser, Order, ShippingAddress } from '@/types';
import { getAllServerOrdersAsync } from '@/lib/supabase-orders';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

type CustomerRow = {
  id: string;
  auth_user_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  role: 'customer';
  addresses: ShippingAddress[] | null;
  created_at: string;
};

function fromCustomerRow(row: CustomerRow): CustomerUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email || '',
    phone: row.phone || '',
    role: 'customer',
    addresses: Array.isArray(row.addresses) ? row.addresses : [],
    createdAt: row.created_at,
  };
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function findCustomer(identifier: string): Promise<CustomerRow | null> {
  const clean = identifier.trim().toLowerCase();
  if (!clean) return null;

  const supabase = createSupabaseAdminClient();
  if (isUuid(clean)) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`id.eq.${clean},auth_user_id.eq.${clean}`)
      .maybeSingle();
    if (error) throw new Error(`Failed to load customer from Supabase: ${error.message}`);
    if (data) return data as CustomerRow;
  }

  if (clean.includes('@')) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('email', clean)
      .limit(1);
    if (error) throw new Error(`Failed to search customer email in Supabase: ${error.message}`);
    return data?.[0] ? data[0] as CustomerRow : null;
  }

  const cleanPhone = clean.replace(/\D/g, '').slice(-10);
  if (cleanPhone.length < 8) return null;

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .ilike('phone', `%${cleanPhone}`)
    .limit(1);
  if (error) throw new Error(`Failed to search customer phone in Supabase: ${error.message}`);
  return data?.[0] ? data[0] as CustomerRow : null;
}

async function createCustomer(user: Omit<CustomerUser, 'id'>, authUserId?: string): Promise<CustomerUser> {
  const { data, error } = await createSupabaseAdminClient()
    .from('customers')
    .insert({
      auth_user_id: authUserId || null,
      name: user.name,
      email: user.email || null,
      phone: user.phone || null,
      role: 'customer',
      addresses: user.addresses,
    })
    .select('*')
    .single();
  if (error) throw new Error(`Failed to create customer in Supabase: ${error.message}`);
  return fromCustomerRow(data as CustomerRow);
}

async function updateCustomer(id: string, updates: Record<string, unknown>): Promise<CustomerUser> {
  const { data, error } = await createSupabaseAdminClient()
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(`Failed to update customer in Supabase: ${error.message}`);
  return fromCustomerRow(data as CustomerRow);
}

export async function clearAllCustomers(): Promise<void> {
  const { error } = await createSupabaseAdminClient().from('customers').delete().not('id', 'is', null);
  if (error) throw new Error(`Failed to clear customers in Supabase: ${error.message}`);
}

export function findCustomerOrders(allOrders: Order[], email?: string, phone?: string, customerId?: string): Order[] {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);

  return allOrders
    .filter((order) => {
      if (customerId && order.customerId === customerId) return true;
      const orderEmail = (order.customerEmail || order.shippingAddress?.email || '').trim().toLowerCase();
      if (cleanEmail && orderEmail === cleanEmail) return true;

      const orderPhone = (order.customerPhone || order.shippingAddress?.phone || '').replace(/\D/g, '').slice(-10);
      return cleanPhone.length >= 8 && orderPhone.length >= 8 &&
        (orderPhone.endsWith(cleanPhone) || cleanPhone.endsWith(orderPhone));
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function addressesFromOrders(orders: Order[]): ShippingAddress[] {
  const addresses: ShippingAddress[] = [];
  for (const order of orders) {
    const address = order.shippingAddress;
    if (!address?.addressLine1) continue;
    const duplicate = addresses.some(
      (existing) => existing.addressLine1 === address.addressLine1 && existing.pincode === address.pincode
    );
    if (!duplicate) addresses.push(address);
  }
  return addresses;
}

export async function getCustomerProfile(identifier: string): Promise<{ user: CustomerUser; orders: Order[] } | null> {
  const clean = identifier.trim().toLowerCase();
  if (!clean) return null;

  const allOrders = await getAllServerOrdersAsync();
  let row = await findCustomer(clean);
  if (!row && isUuid(clean)) {
    const { data: authData, error: authError } = await createSupabaseAdminClient().auth.admin.getUserById(clean);
    if (authError) throw new Error(`Failed to load Supabase Auth user: ${authError.message}`);
    if (authData.user?.email) {
      row = await findCustomer(authData.user.email);
      if (row) {
        const { data: linked, error: linkError } = await createSupabaseAdminClient()
          .from('customers')
          .update({ auth_user_id: clean })
          .eq('id', row.id)
          .select('*')
          .single();
        if (linkError) throw new Error(`Failed to link customer to Supabase Auth: ${linkError.message}`);
        row = linked as CustomerRow;
      } else {
        const created = await createCustomer({
          name: authData.user.user_metadata?.name || authData.user.user_metadata?.full_name || 'Good Fills Customer',
          email: authData.user.email,
          phone: authData.user.user_metadata?.phone || '',
          role: 'customer',
          addresses: [],
          createdAt: new Date().toISOString(),
        }, clean);
        row = await findCustomer(created.id);
      }
    }
  }
  let user = row ? fromCustomerRow(row) : null;
  const customerOrders = findCustomerOrders(
    allOrders,
    user?.email || (clean.includes('@') ? clean : undefined),
    user?.phone || clean,
    user?.id
  );

  if (!user && customerOrders.length > 0) {
    const latestOrder = customerOrders[0];
    user = await createCustomer({
      name: latestOrder.customerName || 'Good Fills Customer',
      email: latestOrder.customerEmail || (clean.includes('@') ? clean : ''),
      phone: latestOrder.customerPhone || clean.replace(/\D/g, '').slice(-10),
      role: 'customer',
      addresses: addressesFromOrders(customerOrders),
      createdAt: customerOrders[customerOrders.length - 1].createdAt || new Date().toISOString(),
    });
  }

  if (!user) return null;

  const updates: Record<string, unknown> = {};
  if (!user.phone && customerOrders[0]?.customerPhone) updates.phone = customerOrders[0].customerPhone;
  if (!user.email && customerOrders[0]?.customerEmail) updates.email = customerOrders[0].customerEmail;
  if (Object.keys(updates).length > 0) user = await updateCustomer(user.id, updates);

  return { user, orders: customerOrders };
}

export async function updateCustomerProfile(
  identifier: string,
  updates: { name?: string; email?: string; phone?: string }
): Promise<CustomerUser | null> {
  const profile = await getCustomerProfile(identifier);
  if (!profile) return null;

  const customerUpdates: Record<string, unknown> = {};
  if (updates.name?.trim()) customerUpdates.name = updates.name.trim();
  if (updates.email?.trim()) customerUpdates.email = updates.email.trim().toLowerCase();
  if (updates.phone !== undefined) customerUpdates.phone = updates.phone.trim();
  if (Object.keys(customerUpdates).length === 0) return profile.user;

  return updateCustomer(profile.user.id, customerUpdates);
}

export async function manageCustomerAddress(
  identifier: string,
  action: 'add' | 'edit' | 'delete' | 'setDefault',
  address?: ShippingAddress,
  addressIndex?: number
): Promise<CustomerUser | null> {
  const profile = await getCustomerProfile(identifier);
  if (!profile) return null;

  const addresses = [...(profile.user.addresses || [])];
  if (action === 'add' && address) {
    addresses.unshift(address);
  } else if (action === 'edit' && address && addressIndex !== undefined && addressIndex >= 0 && addressIndex < addresses.length) {
    addresses[addressIndex] = address;
  } else if (action === 'delete' && addressIndex !== undefined && addressIndex >= 0 && addressIndex < addresses.length) {
    addresses.splice(addressIndex, 1);
  } else if (action === 'setDefault' && addressIndex !== undefined && addressIndex >= 0 && addressIndex < addresses.length) {
    const selected = addresses.splice(addressIndex, 1)[0];
    addresses.unshift(selected);
  }

  return updateCustomer(profile.user.id, { addresses });
}

export async function loginOrRegisterWithGoogle(googleData: {
  email: string;
  name?: string;
  photoUrl?: string;
  authUserId?: string;
}): Promise<{ user: CustomerUser; orders: Order[] } | null> {
  const email = (googleData.email || '').trim().toLowerCase();
  if (!email || !email.includes('@')) return null;

  const row = await findCustomer(email);
  let user = row ? fromCustomerRow(row) : null;
  const allOrders = await getAllServerOrdersAsync();
  const customerOrders = findCustomerOrders(allOrders, email, user?.phone);

  if (!user) {
    const latestOrder = customerOrders[0];
    user = await createCustomer({
      name: googleData.name || latestOrder?.customerName || 'Good Fills Customer',
      email,
      phone: latestOrder?.customerPhone || '',
      role: 'customer',
      addresses: latestOrder ? addressesFromOrders(customerOrders) : [],
      createdAt: latestOrder?.createdAt || new Date().toISOString(),
    }, googleData.authUserId);
  } else if (googleData.name && (!user.name || user.name === 'Good Fills Customer' || user.name === 'New Customer')) {
    user = await updateCustomer(user.id, { name: googleData.name });
  }

  return { user, orders: customerOrders };
}

export const loginOrRegisterCustomer = loginOrRegisterWithGoogle;
