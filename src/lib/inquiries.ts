import { createSupabaseAdminClient } from '@/lib/supabase/admin';

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

type InquiryRow = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  email: string | null;
  category: string;
  order_id: string | null;
  message: string;
  status: Inquiry['status'];
};

function fromInquiryRow(row: InquiryRow): Inquiry {
  return {
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    phone: row.phone,
    email: row.email || undefined,
    category: row.category,
    orderId: row.order_id || undefined,
    message: row.message,
    status: row.status,
  };
}

export async function clearAllInquiries(): Promise<void> {
  const { error } = await createSupabaseAdminClient().from('inquiries').delete().not('id', 'is', null);
  if (error) throw new Error(`Failed to clear inquiries in Supabase: ${error.message}`);
}

export async function getAllInquiries(): Promise<Inquiry[]> {
  const { data, error } = await createSupabaseAdminClient()
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Failed to load inquiries from Supabase: ${error.message}`);
  return (data || []).map((row) => fromInquiryRow(row as InquiryRow));
}

export async function createInquiry(data: {
  name: string;
  phone: string;
  email?: string;
  category: string;
  orderId?: string;
  message: string;
}): Promise<Inquiry> {
  const id = `INQ-${Math.floor(100000 + Math.random() * 900000)}`;
  const { data: created, error } = await createSupabaseAdminClient()
    .from('inquiries')
    .insert({
      id,
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || null,
      category: data.category || 'General Inquiry',
      order_id: data.orderId?.trim() || null,
      message: data.message.trim(),
      status: 'new',
    })
    .select('*')
    .single();
  if (error) throw new Error(`Failed to create inquiry in Supabase: ${error.message}`);
  return fromInquiryRow(created as InquiryRow);
}

export async function updateInquiryStatus(id: string, status: Inquiry['status']): Promise<boolean> {
  const { data, error } = await createSupabaseAdminClient()
    .from('inquiries')
    .update({ status })
    .eq('id', id)
    .select('id')
    .maybeSingle();
  if (error) throw new Error(`Failed to update inquiry in Supabase: ${error.message}`);
  return Boolean(data);
}
