-- Seed catalogue content from the original mock data. Amounts are Kenyan Shillings.

insert into public.wildlife_species (
  id, name, scientific_name, category, conservation_status, featured,
  image_url, hero_image_url, description, habitat, behavior, facts
) values
(
  'grevys-zebra', 'Grevy’s Zebra', 'Equus grevyi', 'Mammals', 'Endangered', true,
  'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1516934024742-b461fba47600?auto=format&fit=crop&w=1600&q=80',
  'The largest of the wild equids and one of the most threatened. Lewa protects roughly 14% of the world’s remaining Grevy’s zebra population.',
  'Semi-arid grasslands and acacia scrub of northern Kenya.',
  'Territorial stallions defend water sources; females and foals move between territories in small groups.',
  array[
    'Distinguished by narrower stripes and a white belly.',
    'Population has declined more than 50% in three decades.',
    'Lewa runs community scout programs to protect calving grounds.'
  ]
),
(
  'black-rhino', 'Black Rhino', 'Diceros bicornis', 'Mammals', 'Critically Endangered', true,
  'https://images.unsplash.com/photo-1567859667906-bafa2c14b4f2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1518709414768-a88981a4515d?auto=format&fit=crop&w=1600&q=80',
  'A browsing rhinoceros with a hooked upper lip. Lewa is a black-rhino stronghold in northern Kenya.',
  'Dense bushland and forest edges within the conservancy.',
  'Solitary and mostly nocturnal, with excellent sense of smell and hearing.',
  array[
    'Every rhino at Lewa is monitored 24/7 by rangers.',
    'Lewa has not lost a rhino to poaching in multiple recent years thanks to intensive protection.',
    'Newborn calves stay with their mothers for 2–3 years.'
  ]
),
(
  'reticulated-giraffe', 'Reticulated Giraffe', 'Giraffa reticulata', 'Mammals', 'Endangered', true,
  'https://images.unsplash.com/photo-1547721064-da6cfb341d50?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1534567110243-8875d64ca8ff?auto=format&fit=crop&w=1600&q=80',
  'Recognisable by its striking web-like coat pattern, the reticulated giraffe is only found in the Horn of Africa.',
  'Open woodland and savannah with abundant acacia.',
  'Browses on high foliage; forms loose herds that shift throughout the day.',
  array[
    'Lewa surveys giraffe populations each year using photo-ID.',
    'Population has dropped by more than half across its range.'
  ]
),
(
  'african-elephant', 'African Elephant', 'Loxodonta africana', 'Mammals', 'Endangered', false,
  'https://images.unsplash.com/photo-1509909756405-be0199881695?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1547721064-da6cfb341d50?auto=format&fit=crop&w=1600&q=80',
  'Lewa forms part of a critical wildlife corridor linking Mount Kenya to the Ngare Ndare Forest, used by elephant families year-round.',
  'Wooded savannah, riverine forest and the Mount Kenya foothills.',
  'Matriarchal families of related females and their calves; bulls roam more widely.',
  array[
    'Elephants use the underpass beneath the A2 highway to reach Mount Kenya.',
    'Herd sizes at Lewa can exceed 60 individuals in dry months.'
  ]
),
(
  'lion', 'Lion', 'Panthera leo', 'Predators', 'Vulnerable', false,
  'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1600&q=80',
  'Apex predator across Lewa’s plains. Prides are monitored to reduce conflict with neighbouring livestock.',
  'Open plains and rocky kopjes across the conservancy.',
  'Social predators; females do most of the hunting cooperatively.',
  array[
    'Individual lions are identified by their whisker spot pattern.',
    'Lewa works with communities to compensate for occasional livestock losses.'
  ]
),
(
  'african-wild-dog', 'African Wild Dog', 'Lycaon pictus', 'Predators', 'Endangered', false,
  'https://images.unsplash.com/photo-1502248103506-76afc15f5c45?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1502248103506-76afc15f5c45?auto=format&fit=crop&w=1600&q=80',
  'One of Africa’s most endangered carnivores. Packs range across northern Kenya, moving in and out of Lewa.',
  'Open woodland and mixed savannah with low human density.',
  'Highly social packs led by an alpha pair; efficient cooperative hunters.',
  array[
    'No two individuals share the same coat pattern.',
    'Packs can travel more than 20km in a single day.'
  ]
),
(
  'kori-bustard', 'Kori Bustard', 'Ardeotis kori', 'Birds', 'Near Threatened', false,
  'https://images.unsplash.com/photo-1516934024742-b461fba47600?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1516934024742-b461fba47600?auto=format&fit=crop&w=1600&q=80',
  'One of the heaviest flying birds. Regularly seen striding across Lewa’s open plains.',
  'Short grass plains and lightly wooded savannah.',
  'Mostly terrestrial; males perform dramatic breeding displays.',
  array[
    'Adult males can weigh over 18kg.',
    'Feeds opportunistically on insects, small reptiles and seeds.'
  ]
)
on conflict (id) do nothing;

insert into public.tourism_services (
  id, title, category, service_type, summary, description, highlights, includes,
  meeting_point, duration_label, capacity, price, currency, pricing_unit,
  image_url, hero_image_url, featured, status
) values
(
  'sunrise-game-drive', 'Sunrise Game Drive', 'Safari', 'Safari',
  'Head out at dawn with a Lewa guide to spot Grevy’s zebra, giraffe and rhino.',
  'Meet at HQ before first light and board a 4x4 to explore the northern plains during the most active wildlife hours. Coffee and light snacks provided.',
  array['Small group of up to 6 guests per vehicle', 'Led by a KPSGA-certified silver-level guide', 'Best light for photography and rare species'],
  array['Guide', 'Vehicle', 'Coffee and snacks', 'Park fees'],
  'Lewa HQ car park', '3 hrs', 6, 14500, 'KES', 'per_guest',
  'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=80',
  true, 'published'
),
(
  'rhino-tracking-walk', 'Rhino Tracking Walk', 'Conservation Activity', 'Conservation Activity',
  'Join a monitoring team on foot as they track a black rhino using field telemetry.',
  'Walk alongside our rhino monitors while they collect the daily sighting records used to protect Lewa’s critically endangered rhino population.',
  array['Guided by a rhino monitoring officer', 'Learn how radio telemetry protects wildlife', 'Minimum age 14 for safety'],
  array['Guide', 'Ranger escort', 'Water', 'Field notebook'],
  'Rhino monitoring base', '4 hrs', 4, 22000, 'KES', 'per_guest',
  'https://images.unsplash.com/photo-1567859667906-bafa2c14b4f2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1567859667906-bafa2c14b4f2?auto=format&fit=crop&w=1600&q=80',
  true, 'published'
),
(
  'lewa-safari-camp', 'Lewa Safari Camp — Tented Suite', 'Accommodation', 'Accommodation',
  'Full-board tented suite with private veranda overlooking the plains.',
  'Nine luxury tented suites nestled in indigenous acacia trees, each with private veranda and en-suite bathroom. Rates include all meals, house drinks and two daily activities.',
  array['Full board with dining under the stars', 'Two guided activities per day included', 'A share of every booking supports the conservancy'],
  array['Full board', 'House drinks', 'Two daily activities', 'Conservancy fees'],
  'Lewa Safari Camp reception', 'per night', 2, 48000, 'KES', 'per_booking',
  'https://images.unsplash.com/photo-1470004914212-05527e49370b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1470004914212-05527e49370b?auto=format&fit=crop&w=1600&q=80',
  true, 'published'
),
(
  'community-market-visit', 'Community Market Visit', 'Community Experience', 'Community Experience',
  'Meet artisans from the neighbouring communities Lewa partners with.',
  'Travel to a nearby community trading centre, learn about the Ntugi women’s enterprise and shop for handmade beadwork straight from the makers.',
  array['Directly supports local livelihoods', 'Guided by a community liaison officer', 'Small group experience'],
  array['Guide', 'Transport', 'Refreshments'],
  'Lewa HQ car park', '2 hrs', 8, 6500, 'KES', 'per_guest',
  'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1600&q=80',
  false, 'published'
),
(
  'guided-nature-walk', 'Guided Nature Walk', 'Guided Tour', 'Guided Tour',
  'Slow-paced walk focused on birdlife, tracks and medicinal plants.',
  'A guided walking safari across the plains with an armed ranger and specialist naturalist. Ideal for photographers and birders.',
  array['Excellent for birdwatchers', 'Learn to read tracks and signs', 'Minimum age 12'],
  array['Guide', 'Ranger escort', 'Water'],
  'Lewa HQ car park', '2.5 hrs', 6, 9500, 'KES', 'per_guest',
  'https://images.unsplash.com/photo-1533450718592-29d45635f0a9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1533450718592-29d45635f0a9?auto=format&fit=crop&w=1600&q=80',
  false, 'published'
),
(
  'ngare-ndare-forest-day-trip', 'Ngare Ndare Forest Day Trip', 'Guided Tour', 'Guided Tour',
  'Swim in blue pools and walk the elevated canopy walkway.',
  'A full-day excursion into the community-managed Ngare Ndare Forest, adjacent to Lewa. Includes lunch and canopy walkway access.',
  array['Canopy walkway 40m above the forest floor', 'Swim in the sapphire-blue Ngare Ndare pools', 'Includes packed lunch'],
  array['Guide', 'Transport', 'Lunch', 'Forest access fee'],
  'Lewa HQ car park', '6 hrs', 8, 17500, 'KES', 'per_guest',
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1600&q=80',
  false, 'published'
)
on conflict (id) do nothing;

insert into public.donation_campaigns (
  id, title, summary, description, story_paragraphs, impact, suggested_amounts,
  goal_amount, amount_raised, currency, cover_image, active, status
) values
(
  'protect-a-rhino', 'Protect a Rhino',
  'Fund 24-hour anti-poaching for Lewa’s critically endangered black rhino.',
  'Lewa is one of the largest black rhino sanctuaries in East Africa. Every rhino here is monitored 24/7.',
  array[
    'Lewa is one of the largest black rhino sanctuaries in East Africa. Every rhino here is monitored 24/7.',
    'Your donation directly funds ranger patrols, veterinary care and the tracking technology that keeps this population safe.'
  ],
  '[{"amount":2500,"description":"One day of GPS tracker uptime for a rhino monitoring team."},{"amount":10000,"description":"Fuel and provisions for a full ranger patrol."},{"amount":50000,"description":"Two-week ration for a K9 anti-poaching dog."}]'::jsonb,
  array[2500, 5000, 10000, 25000]::numeric[],
  2500000, 1874000, 'KES',
  'https://images.unsplash.com/photo-1567859667906-bafa2c14b4f2?auto=format&fit=crop&w=1600&q=80',
  true, 'published'
),
(
  'community-scholarships', 'Community Scholarships',
  'Send a student from a Lewa neighbouring community to secondary school.',
  'Lewa funds full scholarships for high-achieving students from surrounding communities.',
  array[
    'Lewa funds full scholarships for high-achieving students from surrounding communities.',
    'Alumni have gone on to become doctors, lawyers, teachers and conservationists — many returning to work with the conservancy.'
  ],
  '[{"amount":6000,"description":"One month of full boarding fees for a secondary school student."},{"amount":25000,"description":"A full term of tuition, meals and accommodation."},{"amount":100000,"description":"An entire academic year for one student."}]'::jsonb,
  array[5000, 10000, 25000, 50000]::numeric[],
  600000, 423000, 'KES',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80',
  true, 'published'
),
(
  'wildlife-corridors', 'Wildlife Corridors',
  'Keep the underpass and forest linkage open for elephants moving to Mount Kenya.',
  'The Mount Kenya elephant corridor connects Lewa to Africa’s second-highest peak.',
  array[
    'The Mount Kenya elephant corridor connects Lewa to Africa’s second-highest peak.',
    'Ongoing maintenance and community stewardship keep the route safe for elephants and other wildlife.'
  ],
  '[{"amount":4000,"description":"One week of maintenance on the corridor fence line."},{"amount":20000,"description":"A month of monitoring by a corridor scout."}]'::jsonb,
  array[4000, 10000, 20000, 50000]::numeric[],
  1500000, 320000, 'KES',
  'https://images.unsplash.com/photo-1509909756405-be0199881695?auto=format&fit=crop&w=1600&q=80',
  true, 'published'
)
on conflict (id) do nothing;

insert into public.events (
  id, title, description, event_type, start_at, end_at, location, organiser,
  capacity, registration_required, image_url, status
) values
(
  'lewa-safari-marathon', 'Lewa Safari Marathon',
  'One of the world’s toughest marathons, run entirely through wildlife territory. Every entry directly funds conservation and community programmes.',
  'sport', now() + interval '21 days' + interval '6 hours', now() + interval '21 days' + interval '12 hours',
  'Lewa HQ Start Line', 'Lewa Wildlife Conservancy', 2000, true,
  'https://images.unsplash.com/photo-1533450718592-29d45635f0a9?auto=format&fit=crop&w=1600&q=80', 'published'
),
(
  'wildlife-photography-workshop', 'Wildlife Photography Workshop',
  'A three-day workshop with two skilled photographers covering ethical wildlife photography, composition and post-processing.',
  'education', now() + interval '8 days' + interval '15 hours', now() + interval '10 days' + interval '17 hours',
  'Lewa House Learning Room', 'Lewa Education Programme', 16, true,
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=80', 'published'
),
(
  'ranger-open-day', 'Ranger Open Day',
  'Meet the anti-poaching team, tour the operations centre and see how technology protects wildlife 24/7.',
  'community', now() + interval '3 days' + interval '10 hours', now() + interval '3 days' + interval '16 hours',
  'Rhino Monitoring Base', 'Lewa Security Team', 80, false,
  'https://images.unsplash.com/photo-1516934024742-b461fba47600?auto=format&fit=crop&w=1600&q=80', 'published'
),
(
  'community-tree-planting', 'Community Tree Planting',
  'Join community volunteers planting 3,000 indigenous seedlings along Lewa’s eastern boundary. Transport and lunch included.',
  'community', now() + interval '14 days' + interval '8 hours', now() + interval '14 days' + interval '14 hours',
  'Ntugi Village', 'Community Development Programme', 120, true,
  'https://images.unsplash.com/photo-1466692478768-a4950c56b1ca?auto=format&fit=crop&w=1600&q=80', 'published'
)
on conflict (id) do nothing;

insert into public.conservation_programs (id, title, summary, description, category, cover_image, status) values
(
  'anti-poaching', 'Anti-poaching Operations',
  '24/7 field patrols, rapid response, canine unit and aerial surveillance.',
  'Lewa’s security team combines rangers, a canine unit, aerial surveillance and community scouts to keep wildlife safe around the clock.',
  'Wildlife', 'https://images.unsplash.com/photo-1516934024742-b461fba47600?auto=format&fit=crop&w=1200&q=80', 'published'
),
(
  'community-health', 'Community Health',
  'Four clinics serving 40,000 neighbours with maternal, child and preventive care.',
  'Health programmes operate four clinics serving neighbouring communities with maternal, child and preventive care.',
  'Community', 'https://images.unsplash.com/photo-1519824145371-296894a0daa9?auto=format&fit=crop&w=1200&q=80', 'published'
),
(
  'wildlife-corridors-program', 'Wildlife Corridors',
  'Protecting the elephant corridor that links Lewa to Mount Kenya National Park.',
  'The Mount Kenya elephant corridor is a community-managed linkage that keeps seasonal movement open for elephants and other wildlife.',
  'Habitat', 'https://images.unsplash.com/photo-1509909756405-be0199881695?auto=format&fit=crop&w=1200&q=80', 'published'
),
(
  'research-monitoring', 'Research & Monitoring',
  'Long-term studies of rhino, Grevy’s zebra and predator populations.',
  'Researchers and field officers collect long-term data that informs management decisions across the landscape.',
  'Research', 'https://images.unsplash.com/photo-1567859667906-bafa2c14b4f2?auto=format&fit=crop&w=1200&q=80', 'published'
)
on conflict (id) do nothing;

insert into public.education_resources (id, title, summary, content, category, cover_image, reading_minutes, published) values
(
  'e-01', 'Why the Grevy’s zebra matters',
  'Understanding the biology, threats and hope for the world’s most endangered zebra.',
  'Grevy’s zebra is the largest wild equid and one of the most threatened. Lewa protects a significant share of the remaining global population through habitat protection, community scouts and long-term monitoring.',
  'Wildlife', 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80', 6, true
),
(
  'e-02', 'How Lewa protects a rhino',
  'Step inside the operations centre that keeps every rhino safe, 24 hours a day.',
  'Every rhino at Lewa is monitored around the clock. Rangers, veterinary teams and tracking technology work together so that poaching attempts are detected and stopped.',
  'Conservation', 'https://images.unsplash.com/photo-1567859667906-bafa2c14b4f2?auto=format&fit=crop&w=1200&q=80', 8, true
),
(
  'e-03', 'The Mount Kenya elephant corridor',
  'The story of how a fence, an underpass and a community made history for wildlife.',
  'The corridor connects Lewa to Mount Kenya, allowing elephant families to move seasonally. Community stewardship and ongoing maintenance keep the route open.',
  'Conservation', 'https://images.unsplash.com/photo-1509909756405-be0199881695?auto=format&fit=crop&w=1200&q=80', 7, true
),
(
  'e-04', 'Living alongside wildlife',
  'How Lewa’s community programmes turn conservation into shared opportunity.',
  'Clinics, scholarships, water and enterprise programmes make conservation a shared benefit for the people who live alongside wildlife.',
  'Community', 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80', 5, true
)
on conflict (id) do nothing;

insert into public.community_programs (id, title, summary, description, location, cover_image, sort_order, status) values
(
  'comm-health', 'Community Health',
  'Four clinics serving over 40,000 people in neighbouring communities.',
  'Maternal, child and preventive care delivered through four clinics run with community partners.',
  'Lewa landscape', 'https://images.unsplash.com/photo-1519824145371-296894a0daa9?auto=format&fit=crop&w=1200&q=80', 1, 'published'
),
(
  'comm-education', 'Education',
  'School bursaries and infrastructure support across 21 partner schools.',
  'Scholarships and school support help neighbouring students stay in class and return as conservation leaders.',
  '21 partner schools', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80', 2, 'published'
),
(
  'comm-water', 'Water',
  'Reliable, safe drinking water for households and livestock.',
  'Boreholes, piped water and livestock troughs reduce pressure on rivers shared with wildlife.',
  'Neighbouring communities', 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=1200&q=80', 3, 'published'
),
(
  'comm-enterprise', 'Enterprise',
  'Livelihoods programmes for women’s groups and youth entrepreneurs.',
  'Beadwork, produce and small-enterprise support create income that does not depend on wildlife conflict.',
  'Ntugi and surrounding villages', 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80', 4, 'published'
)
on conflict (id) do nothing;

insert into public.faqs (id, category, question, answer, published, sort_order) values
('f-01', 'General', 'What is Lewa Wildlife Conservancy?', 'Lewa is a UNESCO World Heritage Site in northern Kenya that protects endangered species, safeguards ecosystems and supports neighbouring communities.', true, 1),
('f-02', 'General', 'When is the best time to visit?', 'Lewa is a year-round destination. June to October and January to March typically offer the best wildlife viewing.', true, 2),
('f-03', 'Bookings', 'How do I confirm my booking?', 'Your booking is confirmed once we receive payment. You will see the status update in the app and receive a confirmation notification.', true, 1),
('f-04', 'Bookings', 'What is your cancellation policy?', 'Free cancellation up to 72 hours before your booking. Within 72 hours, a 50% fee applies. No-shows are non-refundable.', true, 2),
('f-05', 'Payments', 'Which payment methods are supported?', 'We support card and mobile-money payments in Kenyan Shillings (KSh) through Paystack. Confirmations are always verified server-side.', true, 1),
('f-06', 'Account', 'How do I change my notification preferences?', 'Open the Profile tab, tap Notification preferences, then adjust which topics you want to hear about.', true, 1)
on conflict (id) do nothing;

insert into public.announcements (id, title, body, type, tone, priority, published, publish_at) values
('a-001', 'Rangers rescue snared elephant', 'Our security and veterinary teams safely removed a snare from a young bull elephant near the Ngare Ndare corridor.', 'field', 'default', 1, true, now() - interval '6 hours'),
('a-002', 'Northern gate closure', 'The northern gate is closed for maintenance until Friday. Please use the main gate for entry.', 'operations', 'urgent', 2, true, now() - interval '20 hours'),
('a-003', 'Corridor use hits five-year high', 'Camera-trap data shows elephant use of the Mount Kenya corridor is up 38% year on year.', 'field', 'default', 0, true, now() - interval '2 days')
on conflict (id) do nothing;

insert into public.about_content (key, title, body, sort_order) values
('story', 'Our story', 'Lewa Wildlife Conservancy is a UNESCO World Heritage Site in northern Kenya. What began as a family cattle ranch became a model for community-led conservation, protecting black rhino, Grevy’s zebra and a living wildlife corridor to Mount Kenya.', 1),
('mission', 'Mission', 'To protect wildlife and habitats while supporting neighbouring communities through health, education, water and enterprise programmes.', 2),
('impact', 'Impact', 'Lewa safeguards a globally important rhino population, hosts one of the largest remaining Grevy’s zebra herds, and funds clinics, scholarships and livelihoods across the landscape.', 3),
('visit', 'Visit & support', 'Book a guided safari, stay at a partner camp, join an event or donate in Kenyan Shillings. Every visit and gift funds rangers, veterinary care and community programmes.', 4)
on conflict (key) do nothing;

insert into public.site_settings (key, value) values
('general', '{"name":"Lewa Wildlife Conservancy","currency":"KES","locale":"en-KE","supportEmail":"info@lewa.org"}'::jsonb)
on conflict (key) do nothing;

insert into public.notifications (user_id, title, body, type, broadcast, deep_link) values
(
  null,
  'Welcome to Lewa',
  'Browse wildlife, book a safari in Kenyan Shillings, or support a conservation campaign from your phone.',
  'general_announcement',
  true,
  '/'
),
(
  null,
  'Northern gate notice',
  'The northern gate is closed for maintenance. Use the main gate until Friday.',
  'conservation_announcement',
  true,
  '/'
)
on conflict do nothing;
