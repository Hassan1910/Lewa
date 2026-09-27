import { supabase } from '@/lib/supabase';

export type FeedbackInput = {
  userId: string | null;
  category: string;
  subject: string;
  message: string;
  reference?: string | null;
};

export async function submitFeedback(input: FeedbackInput): Promise<void> {
  const { error } = await supabase.from('feedback').insert({
    user_id: input.userId,
    category: input.category,
    subject: input.subject,
    message: input.message,
    reference: input.reference ?? null,
    status: 'open',
  });
  if (error) throw error;
}
