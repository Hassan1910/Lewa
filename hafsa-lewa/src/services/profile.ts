import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/auth-context';

export async function updateProfile(
  userId: string,
  patch: { fullName?: string; phone?: string | null; avatarUrl?: string | null },
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: patch.fullName,
      phone: patch.phone ?? null,
      avatar_url: patch.avatarUrl ?? null,
    })
    .eq('id', userId)
    .select('id, full_name, email, phone, avatar_url, role, status')
    .single();
  if (error) throw error;
  return data as Profile;
}
