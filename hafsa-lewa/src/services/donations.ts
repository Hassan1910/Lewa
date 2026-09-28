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

export type MyDonation = {
  id: string;
  reference: string;
  campaignId: string;
  campaignTitle: string;
  amount: number;
  currency: string;
  status: string;
  donorName: string | null;
  donorEmail: string | null;
  message: string | null;
  createdAt: string;
};

type DonationRow = {
  id: string;
  reference: string;
  campaign_id: string;
  amount: number | string;
  currency: string;
  status: string;
  donor_name: string | null;
  donor_email: string | null;
  message: string | null;
  created_at: string;
  donation_campaigns: { title: string } | { title: string }[] | null;
};

const DONATION_SELECT =
  'id, reference, campaign_id, amount, currency, status, donor_name, donor_email, message, created_at, donation_campaigns(title)';

function mapDonation(row: DonationRow): MyDonation {
  const campaign = Array.isArray(row.donation_campaigns) ? row.donation_campaigns[0] : row.donation_campaigns;
  return {
    id: row.id,
    reference: row.reference,
    campaignId: row.campaign_id,
    campaignTitle: campaign?.title ?? 'Conservation gift',
    amount: Number(row.amount),
    currency: row.currency,
    status: row.status,
    donorName: row.donor_name,
    donorEmail: row.donor_email,
    message: row.message,
    createdAt: row.created_at,
  };
}

/** Gifts recorded on this account, including ones still waiting on Paystack. */
export async function listMyDonations(userId: string): Promise<MyDonation[]> {
  const { data, error } = await supabase
    .from('donations')
    .select(DONATION_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as DonationRow[]).map(mapDonation);
}

export async function getDonationById(id: string): Promise<MyDonation | null> {
  const { data, error } = await supabase.from('donations').select(DONATION_SELECT).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapDonation(data as DonationRow) : null;
}

const REF_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateDonationReference(): string {
  let ref = 'DN-';
  for (let i = 0; i < 6; i += 1) ref += REF_CHARS[Math.floor(Math.random() * REF_CHARS.length)];
  return ref;
}

export async function createDonationIntent(input: {
  campaignId: string;
  userId: string | null;
  amount: number;
  currency?: string;
  donorEmail?: string | null;
  donorName?: string | null;
  message?: string | null;
}): Promise<{ id: string; reference: string }> {
  let lastError: { message: string; code?: string } | null = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const reference = generateDonationReference();
    const { data, error } = await supabase
      .from('donations')
      .insert({
        reference,
        campaign_id: input.campaignId,
        user_id: input.userId,
        amount: input.amount,
        currency: input.currency ?? 'KES',
        donor_email: input.donorEmail ?? null,
        donor_name: input.donorName ?? null,
        message: input.message ?? null,
        status: 'pending',
      })
      .select('id, reference')
      .single();
    if (!error) return { id: data.id as string, reference: data.reference as string };
    lastError = error;
    if (error.code !== '23505') break;
  }
  throw new Error(lastError?.message ?? 'Could not record this donation');
}
