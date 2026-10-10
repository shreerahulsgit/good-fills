import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function getSupabaseUser() {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return data.user;
}