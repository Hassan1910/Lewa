import { supabase } from '@/lib/supabase';
import type { DonationCampaign, DonationImpact } from '@/services/types';

const SELECT =
  'id, title, summary, description, story_paragraphs, impact, suggested_amounts, goal_amount, amount_raised, currency, cover_image, active';

type Row = {
  id: string;
  title: string;
  summary: string | null;
  description: string | null;
  story_paragraphs: string[] | null;
  impact: unknown;
  suggested_amounts: (number | string)[] | null;
  goal_amount: number | string;
  amount_raised: number | string;
  currency: string;
  cover_image: string | null;
  active: boolean;
};

function mapRow(r: Row): DonationCampaign {
  const impactList: DonationImpact[] = Array.isArray(r.impact)
    ? (r.impact as { amount: number | string; description: string }[]).map((i) => ({
        amount: Number(i.amount),
        description: i.description,
      }))
    : [];
  return {
    id: r.id,
    title: r.title,
    summary: r.summary,
    description: r.description,
    storyParagraphs: r.story_paragraphs ?? [],
    impact: impactList,
    suggestedAmounts: (r.suggested_amounts ?? []).map((n) => Number(n)),
    goalAmount: Number(r.goal_amount),
    amountRaised: Number(r.amount_raised),
    currency: r.currency,
    coverImage: r.cover_image,
    active: r.active,
  };
}

export async function listActiveCampaigns(): Promise<DonationCampaign[]> {
  const { data, error } = await supabase
    .from('donation_campaigns')
    .select(SELECT)
    .eq('active', true)
    .order('title');
  if (error) throw error;
  return (data as Row[]).map(mapRow);
}

export async function getCampaignById(id: string): Promise<DonationCampaign | null> {
  const { data, error } = await supabase.from('donation_campaigns').select(SELECT).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as Row) : null;
}

export async function createDonationIntent(input: {
  campaignId: string;
  userId: string | null;
  amount: number;
  currency?: string;
  donorEmail?: string | null;
  donorName?: string | null;
  message?: string | null;
}): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('donations')
    .insert({
      campaign_id: input.campaignId,
      user_id: input.userId,
      amount: input.amount,
      currency: input.currency ?? 'KES',
      donor_email: input.donorEmail ?? null,
      donor_name: input.donorName ?? null,
      message: input.message ?? null,
      status: 'pending',
    })
    .select('id')
    .single();
  if (error) throw error;
  return { id: data.id as string };
}
