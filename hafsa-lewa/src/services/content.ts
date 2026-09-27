import { supabase } from '@/lib/supabase';
import type {
  AboutSection,
  Announcement,
  CommunityProgram,
  ConservationProgram,
  EducationResource,
  Faq,
} from '@/services/types';

// -------------------- announcements --------------------
type AnnRow = {
  id: string;
  title: string;
  body: string;
  tone: 'default' | 'urgent';
  publish_at: string;
  priority: number;
};

export async function listAnnouncements(limit = 5): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from('announcements')
    .select('id, title, body, tone, publish_at, priority')
    .lte('publish_at', new Date().toISOString())
    .order('priority', { ascending: false })
    .order('publish_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as AnnRow[]).map((r) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    tone: r.tone,
    publishAt: r.publish_at,
    priority: r.priority,
  }));
}

// -------------------- conservation --------------------
type ConsRow = {
  id: string;
  title: string;
  summary: string | null;
  description: string | null;
  category: string | null;
  cover_image: string | null;
};

export async function listConservationPrograms(): Promise<ConservationProgram[]> {
  const { data, error } = await supabase
    .from('conservation_programs')
    .select('id, title, summary, description, category, cover_image')
    .order('title');
  if (error) throw error;
  return (data as ConsRow[]).map((r) => ({
    id: r.id,
    title: r.title,
    summary: r.summary,
    description: r.description,
    category: r.category,
    coverImage: r.cover_image,
  }));
}

// -------------------- education --------------------
type EduRow = {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  category: string | null;
  cover_image: string | null;
  reading_minutes: number | null;
};

export async function listEducationResources(): Promise<EducationResource[]> {
  const { data, error } = await supabase
    .from('education_resources')
    .select('id, title, summary, content, category, cover_image, reading_minutes')
    .order('title');
  if (error) throw error;
  return (data as EduRow[]).map((r) => ({
    id: r.id,
    title: r.title,
    summary: r.summary,
    content: r.content,
    category: r.category,
    coverImage: r.cover_image,
    readingMinutes: r.reading_minutes,
  }));
}

// -------------------- community --------------------
type CommRow = {
  id: string;
  title: string;
  summary: string | null;
  description: string | null;
  location: string | null;
  cover_image: string | null;
  sort_order: number;
};

export async function listCommunityPrograms(): Promise<CommunityProgram[]> {
  const { data, error } = await supabase
    .from('community_programs')
    .select('id, title, summary, description, location, cover_image, sort_order')
    .order('sort_order');
  if (error) throw error;
  return (data as CommRow[]).map((r) => ({
    id: r.id,
    title: r.title,
    summary: r.summary,
    description: r.description,
    location: r.location,
    coverImage: r.cover_image,
    sortOrder: r.sort_order,
  }));
}

// -------------------- faqs --------------------
type FaqRow = {
  id: string;
  category: string;
  question: string;
  answer: string;
  sort_order: number;
};

export async function listFaqs(): Promise<Faq[]> {
  const { data, error } = await supabase
    .from('faqs')
    .select('id, category, question, answer, sort_order')
    .order('category')
    .order('sort_order');
  if (error) throw error;
  return (data as FaqRow[]).map((r) => ({
    id: r.id,
    category: r.category,
    question: r.question,
    answer: r.answer,
    sortOrder: r.sort_order,
  }));
}

// -------------------- about --------------------
type AboutRow = {
  key: string;
  title: string;
  body: string;
  sort_order: number;
};

export async function listAboutSections(): Promise<AboutSection[]> {
  const { data, error } = await supabase
    .from('about_content')
    .select('key, title, body, sort_order')
    .order('sort_order');
  if (error) throw error;
  return (data as AboutRow[]).map((r) => ({
    key: r.key,
    title: r.title,
    body: r.body,
    sortOrder: r.sort_order,
  }));
}
