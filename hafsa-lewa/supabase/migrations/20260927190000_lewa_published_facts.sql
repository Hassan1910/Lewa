-- Published facts from lewa.org, paraphrased for the content tables created in 0002.
-- Those tables use status, not a published flag. Updates cover both seed id sets.
-- Amounts, lodge rates, and event dates are left unchanged.

update public.wildlife_species
set
  description = 'The largest of the wild equids and one of the most threatened. Lewa protects Grevy’s zebra on the northern Kenya landscape, together with black rhino, elephant, lion, and giraffe.',
  facts = array[
    'Distinguished by narrower stripes and a white belly.',
    'Lewa names Grevy’s zebra among the endangered species it works to protect.',
    'Habitat protection and community partnerships support the herds on this landscape.'
  ]
where id = 'grevys-zebra';

update public.wildlife_species
set
  description = 'A browsing rhinoceros with a hooked upper lip. Lewa reports that 14% of Kenya’s rhino population lives on this landscape.',
  facts = array[
    'A March 2025 count put the Lewa–Borana landscape at 273 rhinos: 130 black and 143 white.',
    'That count included 33 calves, 14 of them black and 19 white.',
    'A later 2025 update reported more than 280 rhinos on the landscape.',
    'The rhino sanctuary covers about 93,000 acres. Lewa itself is described as 62,000 acres of protected wilderness.'
  ]
where id = 'black-rhino';

update public.conservation_programs
set
  summary = 'Rangers, a canine unit, and aerial support protect wildlife while illegal demand for wildlife products continues.',
  description = 'Lewa’s public security pages describe anti-poaching as ongoing work. Well-resourced poaching groups remain a threat wherever illegal demand for wildlife products exists, including for animals under Lewa’s protection.'
where id = 'anti-poaching';

update public.conservation_programs
set
  summary = 'Four Lewa-supported clinics serve 37,490+ patients a year.',
  description = 'Lewa reports 37,490+ patients served each year across four clinics, as part of community work that also includes education, water, and livelihoods.'
where id = 'community-health';

update public.conservation_programs
set
  summary = 'Long-term monitoring of rhino, Grevy’s zebra, and other priority species.',
  description = 'Lewa’s conservation and wildlife work tracks priority species on the Lewa–Borana landscape, including black and white rhinos and the endangered Grevy’s zebra.'
where id = 'research-monitoring';

update public.education_resources
set
  summary = 'Why Grevy’s zebra is one of the endangered species Lewa works to protect.',
  content = 'Grevy’s zebra is the largest wild equid and one of the most threatened. Lewa includes it among the endangered species protected on the northern Kenya landscape, alongside black rhino, elephant, lion, and giraffe. The conservancy pairs habitat protection with community programmes so people and wildlife can share this landscape.'
where id = 'e-01';

update public.education_resources
set
  summary = 'How the Lewa–Borana landscape reports its rhino population.',
  content = 'Lewa says 14% of Kenya’s rhino population lives here. A March 2025 update put the Lewa–Borana landscape at 273 rhinos — 130 black and 143 white — including 33 calves born in that monitoring period (14 black and 19 white). A later 2025 note put the landscape population above 280. The rhino sanctuary is described as about 93,000 acres, separate from Lewa’s 62,000 acres of protected wilderness.'
where id = 'e-02';

update public.education_resources
set
  summary = 'Clinics, bursaries, water, and women’s enterprise on the Lewa landscape.',
  content = 'Lewa’s community work includes healthcare, education, water, women’s micro-enterprise, sustainable agriculture, and agro-forestry. The conservancy reports 37,490+ patients a year across four clinics, 9,180+ children reached by education programmes each year, and 2,160+ women in the micro-enterprise programme.'
where id = 'e-04';

insert into public.education_resources (id, title, summary, content, category, cover_image, reading_minutes, status)
values
(
  'e-05',
  'Lewa’s bursary programme',
  'Secondary-school support for students leaving Lewa’s partner primary schools.',
  'Lewa’s bursary covers up to 75% of secondary tuition, and families contribute the remaining 25%. The programme aims to support about 720 students a year as they move from 19 primary schools into secondary school, and to stay with them through secondary school. More than 1,100 students have received bursary or scholarship support since the programme began. In 2024, 518 students received that support, including 94 in college or university. Students also receive mentorship on careers, life skills, and mental health.',
  'Community',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
  5,
  'published'
),
(
  'e-06',
  'Conservation education',
  'Lewa’s programme for young people on wildlife and the environment.',
  'Lewa’s conservation education programme sets out to give Kenya’s young people knowledge and skills to conserve wildlife and the environment. The stated goal is to influence attitudes, behaviour, and actions so that conservation outcomes improve. It sits alongside school programmes and the bursary.',
  'Conservation',
  'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80',
  4,
  'published'
)
on conflict (id) do update set
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  category = excluded.category,
  cover_image = excluded.cover_image,
  reading_minutes = excluded.reading_minutes,
  status = excluded.status;

update public.community_programs
set
  title = 'Healthcare',
  summary = '37,490+ patients a year across 4 Lewa-supported clinics.',
  description = 'Lewa reports that four clinics serve 37,490+ patients each year. Healthcare is one of the community investments listed with education, water, micro-enterprise, and youth empowerment.',
  location = 'Four Lewa-supported clinics'
where id in ('comm-health', 'community-health-c');

update public.community_programs
set
  title = 'Education and bursaries',
  summary = '9,180+ children reached each year, with bursaries from 19 primary schools.',
  description = 'Education programmes reach 9,180+ children a year. The bursary covers up to 75% of secondary tuition, with families contributing 25%, and is planned for about 720 students a year moving on from 19 primary schools. More than 1,100 students have received bursary or scholarship support since the programme began. In 2024 that support reached 518 students, including 94 in college or university.',
  location = '19 primary schools'
where id in ('comm-education', 'education-c');

update public.community_programs
set
  summary = 'Cleaner, more reliable water for households and livestock near the conservancy.',
  description = 'Water is one of Lewa’s published community programmes, alongside healthcare, education, and livelihoods, so neighbouring communities can meet daily needs without depending only on rivers shared with wildlife.'
where id in ('comm-water', 'water-c');

update public.community_programs
set
  title = 'Women’s micro-enterprise',
  summary = '2,160+ women have joined since the programme began.',
  description = 'Lewa launched the Women’s Micro-Enterprise programme in 2001 and issued the first loans in 2003. More than 2,160 women have joined to improve their livelihoods. Alongside capital and training, participants learn about environmental protection and wildlife.',
  location = 'Neighbouring communities'
where id in ('comm-enterprise', 'enterprise-c');

insert into public.community_programs (id, title, summary, description, location, cover_image, sort_order, status)
values
(
  'comm-agriculture',
  'Sustainable agriculture',
  'Farming support for communities that share the landscape with wildlife.',
  'Sustainable agriculture is one of the community programmes Lewa lists with healthcare, education, water, and micro-enterprise.',
  'Neighbouring communities',
  'https://images.unsplash.com/photo-1466692478768-a4950c56b1ca?auto=format&fit=crop&w=1200&q=80',
  5,
  'published'
),
(
  'comm-agroforestry',
  'Agro-forestry',
  'Trees and farming combined in Lewa’s community work.',
  'Agro-forestry is listed with Lewa’s other community programmes, linking tree cover with livelihoods on land beside the conservancy.',
  'Neighbouring communities',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
  6,
  'published'
)
on conflict (id) do update set
  title = excluded.title,
  summary = excluded.summary,
  description = excluded.description,
  location = excluded.location,
  cover_image = excluded.cover_image,
  sort_order = excluded.sort_order,
  status = excluded.status;

insert into public.faqs (id, category, question, answer, status, sort_order)
values
(
  'f-07',
  'About',
  'What is community-based conservation?',
  'It means working with the people who live beside a protected area, not only managing wildlife inside it. Lewa describes this as reinvesting the benefits of wildlife protection and tourism in neighbouring communities, including education, livelihoods, and healthcare.',
  'published',
  1
),
(
  'f-08',
  'About',
  'How is Lewa funded?',
  'Lewa’s FAQ says about 70% of revenue is raised through fundraising and about 30% comes from tourism, with further support from the Lewa Endowment Fund. Of the fundraising, the FAQ attributes about 83% to individuals, 11% to zoos and partners, 4% to foundations, and about 1% each to events and other income.',
  'published',
  2
),
(
  'f-09',
  'About',
  'How many people does Lewa employ?',
  'Lewa employs 310 people. Since 1995, about 90% of staff have come from neighbouring areas.',
  'published',
  3
),
(
  'f-10',
  'About',
  'How is Lewa governed?',
  'A Kenyan board sets strategy and oversight, and Lewa’s management team carries that direction out. Separate fundraising charities in the USA, the UK, and Canada coordinate with Lewa and are governed by their own boards.',
  'published',
  4
),
(
  'f-11',
  'About',
  'How is Lewa connected to the Northern Rangelands Trust?',
  'Lewa and the Northern Rangelands Trust are separate organisations with a close working relationship. Lewa provides logistical and technical support. The Trust supports community conservancies across northern Kenya that link livelihoods with the care of wildlife and other natural resources.',
  'published',
  5
)
on conflict (id) do update set
  category = excluded.category,
  question = excluded.question,
  answer = excluded.answer,
  status = excluded.status,
  sort_order = excluded.sort_order;

update public.announcements
set
  title = '24 rhinos given permanent IDs',
  body = 'Vets, rangers, and conservation partners finished an eight-day notching operation on the Lewa–Borana landscape, permanently identifying 24 black and white rhinos.',
  tone = 'default',
  priority = 3,
  status = 'published',
  publish_at = '2026-09-10T08:00:00Z',
  expires_at = null
where id = 'a-001';

update public.announcements
set
  title = '2025 annual report is published',
  body = 'Lewa’s 2025 annual report looks back on 30 years of community-centred conservation and on the work of the past year.',
  tone = 'default',
  priority = 2,
  status = 'published',
  publish_at = '2026-07-01T08:00:00Z',
  expires_at = null
where id = 'a-002';

update public.announcements
set
  title = '33 rhino calves on Lewa–Borana',
  body = 'A March 2025 update reported 33 newborn rhinos on the Lewa–Borana landscape, 19 white and 14 black, and a population of 273 at that count.',
  tone = 'default',
  priority = 1,
  status = 'published',
  publish_at = '2025-03-03T08:00:00Z',
  expires_at = null
where id = 'a-003';

update public.notifications
set
  title = '2025 annual report',
  body = 'Lewa’s 2025 annual report marks 30 years of community-centred conservation.',
  type = 'conservation_announcement'
where title = 'Northern gate notice';

update public.about_content
set
  title = 'Our story',
  body = 'Lewa Wildlife Conservancy sits at the foothills of Mount Kenya. For more than 30 years it has protected endangered wildlife and worked with neighbouring communities. The conservancy describes 62,000 acres of protected wilderness.'
where key in ('story', 'history');

update public.about_content
set
  title = 'Mission',
  body = 'Lewa’s vision is a Kenya where people and wildlife coexist. That future depends on communities thriving through livelihoods that protect natural habitats. The conservancy invests in education, healthcare, water, micro-enterprise, and youth empowerment, with a focus on black rhino, Grevy’s zebra, elephants, lions, cheetahs, and giraffes.'
where key = 'mission';

update public.about_content
set
  title = 'Impact',
  body = '14% of Kenya’s rhino population lives here. Education programmes reach 9,180+ children a year. More than 2,160 women have joined the micro-enterprise programme. Four Lewa-supported clinics serve 37,490+ patients a year.'
where key = 'impact';

update public.about_content
set
  title = 'Visit and contact',
  body = 'Lewa Wildlife Conservancy, Isiolo 60300, Kenya. Phone +254-722-203562/3. Email info@lewa.org.'
where key in ('visit', 'contact');

-- site_settings lived only in the removed duplicate schema.
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'site_settings'
      and policyname = 'site_settings_staff_read'
  ) then
    create policy site_settings_staff_read on public.site_settings
      for select
      using (public.is_staff());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'site_settings'
      and policyname = 'site_settings_admin_write'
  ) then
    create policy site_settings_admin_write on public.site_settings
      for all
      using (public.is_admin())
      with check (public.is_admin());
  end if;
end $$;

insert into public.site_settings (key, value)
values (
  'general',
  jsonb_build_object(
    'name', 'Lewa Wildlife Conservancy',
    'currency', 'KES',
    'locale', 'en-KE',
    'supportEmail', 'info@lewa.org'
  )
)
on conflict (key) do nothing;

update public.site_settings
set value = value || jsonb_build_object(
  'phone', '+254-722-203562/3',
  'address', 'Isiolo 60300, Kenya',
  'supportEmail', 'info@lewa.org'
)
where key = 'general';
