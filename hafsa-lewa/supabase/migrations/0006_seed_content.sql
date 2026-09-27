-- Seed content mirrors the previous mock data with KES pricing (approx USD
-- amount converted at 130 KES/USD and rounded to sensible retail figures).
-- Everything is upsert-safe so re-running the migration is idempotent.

-- ---------------------------------------------------------------------------
-- Wildlife
-- ---------------------------------------------------------------------------
insert into public.wildlife_species (id, name, scientific_name, category, conservation_status, description, habitat, behavior, facts, image_url, hero_image_url, featured, status)
values
  ('grevys-zebra','Grevy''s Zebra','Equus grevyi','Mammals','Endangered',
   'The largest of the wild equids and one of the most threatened. Lewa protects roughly 14% of the world''s remaining Grevy''s zebra population.',
   'Semi-arid grasslands and acacia scrub of northern Kenya.',
   'Territorial stallions defend water sources; females and foals move between territories in small groups.',
   array['Distinguished by narrower stripes and a white belly.','Population has declined more than 50% in three decades.','Lewa runs community scout programs to protect calving grounds.'],
   'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80',
   'https://images.unsplash.com/photo-1516934024742-b461fba47600?auto=format&fit=crop&w=1600&q=80',
   true,'published'),
  ('black-rhino','Black Rhino','Diceros bicornis','Mammals','Critically Endangered',
   'A browsing rhinoceros with a hooked upper lip. Lewa is a black-rhino stronghold in northern Kenya.',
   'Dense bushland and forest edges within the conservancy.',
   'Solitary and mostly nocturnal, with excellent sense of smell and hearing.',
   array['Every rhino at Lewa is monitored 24/7 by rangers.','Lewa has not lost a rhino to poaching in multiple recent years thanks to intensive protection.','Newborn calves stay with their mothers for 2-3 years.'],
   'https://images.unsplash.com/photo-1567859667906-bafa2c14b4f2?auto=format&fit=crop&w=1200&q=80',
   'https://images.unsplash.com/photo-1518709414768-a88981a4515d?auto=format&fit=crop&w=1600&q=80',
   true,'published'),
  ('reticulated-giraffe','Reticulated Giraffe','Giraffa reticulata','Mammals','Endangered',
   'Recognisable by its striking web-like coat pattern, the reticulated giraffe is only found in the Horn of Africa.',
   'Open woodland and savannah with abundant acacia.',
   'Browses on high foliage; forms loose herds that shift throughout the day.',
   array['Lewa surveys giraffe populations each year using photo-ID.','Population has dropped by more than half across its range.'],
   'https://images.unsplash.com/photo-1547721064-da6cfb341d50?auto=format&fit=crop&w=1200&q=80',
   'https://images.unsplash.com/photo-1534567110243-8875d64ca8ff?auto=format&fit=crop&w=1600&q=80',
   true,'published'),
  ('african-elephant','African Elephant','Loxodonta africana','Mammals','Endangered',
   'Lewa forms part of a critical wildlife corridor linking Mount Kenya to the Ngare Ndare Forest, used by elephant families year-round.',
   'Wooded savannah, riverine forest and the Mount Kenya foothills.',
   'Matriarchal families of related females and their calves; bulls roam more widely.',
   array['Elephants use the underpass beneath the A2 highway to reach Mount Kenya.','Herd sizes at Lewa can exceed 60 individuals in dry months.'],
   'https://images.unsplash.com/photo-1509909756405-be0199881695?auto=format&fit=crop&w=1200&q=80',
   'https://images.unsplash.com/photo-1547721064-da6cfb341d50?auto=format&fit=crop&w=1600&q=80',
   false,'published'),
  ('lion','Lion','Panthera leo','Predators','Vulnerable',
   'Apex predator across Lewa''s plains. Prides are monitored to reduce conflict with neighbouring livestock.',
   'Open plains and rocky kopjes across the conservancy.',
   'Social predators; females do most of the hunting cooperatively.',
   array['Individual lions are identified by their whisker spot pattern.','Lewa works with communities to compensate for occasional livestock losses.'],
   'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80',
   'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1600&q=80',
   false,'published'),
  ('african-wild-dog','African Wild Dog','Lycaon pictus','Predators','Endangered',
   'One of Africa''s most endangered carnivores. Packs range across northern Kenya, moving in and out of Lewa.',
   'Open woodland and mixed savannah with low human density.',
   'Highly social packs led by an alpha pair; efficient cooperative hunters.',
   array['No two individuals share the same coat pattern.','Packs can travel more than 20km in a single day.'],
   'https://images.unsplash.com/photo-1502248103506-76afc15f5c45?auto=format&fit=crop&w=1200&q=80',
   'https://images.unsplash.com/photo-1502248103506-76afc15f5c45?auto=format&fit=crop&w=1600&q=80',
   false,'published'),
  ('kori-bustard','Kori Bustard','Ardeotis kori','Birds','Near Threatened',
   'One of the heaviest flying birds. Regularly seen striding across Lewa''s open plains.',
   'Short grass plains and lightly wooded savannah.',
   'Mostly terrestrial; males perform dramatic breeding displays.',
   array['Adult males can weigh over 18kg.','Feeds opportunistically on insects, small reptiles and seeds.'],
   'https://images.unsplash.com/photo-1516934024742-b461fba47600?auto=format&fit=crop&w=1200&q=80',
   'https://images.unsplash.com/photo-1516934024742-b461fba47600?auto=format&fit=crop&w=1600&q=80',
   false,'published')
on conflict (id) do update
  set name = excluded.name,
      scientific_name = excluded.scientific_name,
      category = excluded.category,
      conservation_status = excluded.conservation_status,
      description = excluded.description,
      habitat = excluded.habitat,
      behavior = excluded.behavior,
      facts = excluded.facts,
      image_url = excluded.image_url,
      hero_image_url = excluded.hero_image_url,
      featured = excluded.featured,
      status = excluded.status;

-- ---------------------------------------------------------------------------
-- Tourism services
-- ---------------------------------------------------------------------------
insert into public.tourism_services (id, title, category, service_type, summary, description, highlights, includes, meeting_point, duration_label, capacity, price, currency, pricing_unit, image_url, hero_image_url, featured, status)
values
  ('sunrise-game-drive','Sunrise Game Drive','Safari','safari',
   'Head out at dawn with a Lewa guide to spot Grevy''s zebra, giraffe and rhino.',
   'Meet at HQ before first light and board a 4x4 to explore the northern plains during the most active wildlife hours. Coffee and light snacks provided.',
   array['Small group of up to 6 guests per vehicle','Led by a KPSGA-certified silver-level guide','Best light for photography and rare species'],
   array['Guide','Vehicle','Coffee and snacks','Park fees'],
   'Lewa HQ car park','3 hrs',6,18000,'KES','per_guest',
   'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
   'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=80',
   true,'published'),
  ('rhino-tracking-walk','Rhino Tracking Walk','Conservation Activity','conservation',
   'Join a monitoring team on foot as they track a black rhino using field telemetry.',
   'Walk alongside our rhino monitors while they collect the daily sighting records used to protect Lewa''s critically endangered rhino population.',
   array['Guided by a rhino monitoring officer','Learn how radio telemetry protects wildlife','Minimum age 14 for safety'],
   array['Guide','Ranger escort','Water','Field notebook'],
   'Rhino monitoring base','4 hrs',4,28000,'KES','per_guest',
   'https://images.unsplash.com/photo-1567859667906-bafa2c14b4f2?auto=format&fit=crop&w=1200&q=80',
   'https://images.unsplash.com/photo-1567859667906-bafa2c14b4f2?auto=format&fit=crop&w=1600&q=80',
   true,'published'),
  ('lewa-safari-camp','Lewa Safari Camp — Tented Suite','Accommodation','accommodation',
   'Full-board tented suite with private veranda overlooking the plains.',
   'Nine luxury tented suites nestled in indigenous acacia trees, each with private veranda and en-suite bathroom. Rates include all meals, house drinks and two daily activities.',
   array['Full board with dining under the stars','Two guided activities per day included','A share of every booking supports the conservancy'],
   array['Full board','House drinks','Two daily activities','Conservancy fees'],
   'Lewa Safari Camp reception','per night',2,62000,'KES','per_booking',
   'https://images.unsplash.com/photo-1470004914212-05527e49370b?auto=format&fit=crop&w=1200&q=80',
   'https://images.unsplash.com/photo-1470004914212-05527e49370b?auto=format&fit=crop&w=1600&q=80',
   true,'published'),
  ('community-market-visit','Community Market Visit','Community Experience','community',
   'Meet artisans from the neighbouring communities Lewa partners with.',
   'Travel to a nearby community trading centre, learn about the Ntugi women''s enterprise and shop for handmade beadwork straight from the makers.',
   array['Directly supports local livelihoods','Guided by a community liaison officer','Small group experience'],
   array['Guide','Transport','Refreshments'],
   'Lewa HQ car park','2 hrs',8,8500,'KES','per_guest',
   'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80',
   'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1600&q=80',
   false,'published'),
  ('guided-nature-walk','Guided Nature Walk','Guided Tour','guided_tour',
   'Slow-paced walk focused on birdlife, tracks and medicinal plants.',
   'A guided walking safari across the plains with an armed ranger and specialist naturalist. Ideal for photographers and birders.',
   array['Excellent for birdwatchers','Learn to read tracks and signs','Minimum age 12'],
   array['Guide','Ranger escort','Water'],
   'Lewa HQ car park','2.5 hrs',6,12000,'KES','per_guest',
   'https://images.unsplash.com/photo-1533450718592-29d45635f0a9?auto=format&fit=crop&w=1200&q=80',
   'https://images.unsplash.com/photo-1533450718592-29d45635f0a9?auto=format&fit=crop&w=1600&q=80',
   false,'published'),
  ('ngare-ndare-forest-day-trip','Ngare Ndare Forest Day Trip','Guided Tour','guided_tour',
   'Swim in blue pools and walk the elevated canopy walkway.',
   'A full-day excursion into the community-managed Ngare Ndare Forest, adjacent to Lewa. Includes lunch and canopy walkway access.',
   array['Canopy walkway 40m above the forest floor','Swim in the sapphire-blue Ngare Ndare pools','Includes packed lunch'],
   array['Guide','Transport','Lunch','Forest access fee'],
   'Lewa HQ car park','6 hrs',8,22500,'KES','per_guest',
   'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80',
   'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1600&q=80',
   false,'published')
on conflict (id) do update
  set title = excluded.title,
      category = excluded.category,
      service_type = excluded.service_type,
      summary = excluded.summary,
      description = excluded.description,
      highlights = excluded.highlights,
      includes = excluded.includes,
      meeting_point = excluded.meeting_point,
      duration_label = excluded.duration_label,
      capacity = excluded.capacity,
      price = excluded.price,
      currency = excluded.currency,
      pricing_unit = excluded.pricing_unit,
      image_url = excluded.image_url,
      hero_image_url = excluded.hero_image_url,
      featured = excluded.featured,
      status = excluded.status;

-- ---------------------------------------------------------------------------
-- Events (dynamic dates relative to now())
-- ---------------------------------------------------------------------------
insert into public.events (id, title, description, event_type, start_at, end_at, location, organiser, capacity, registration_required, image_url, status)
values
  ('lewa-safari-marathon','Lewa Safari Marathon',
   'One of the world''s toughest marathons, run entirely through wildlife territory. Every entry directly funds conservation and community programmes.',
   'community',
   now() + interval '21 days' + interval '6 hours',
   now() + interval '21 days' + interval '12 hours',
   'Lewa HQ Start Line','Lewa Wildlife Conservancy',1500,true,
   'https://images.unsplash.com/photo-1533450718592-29d45635f0a9?auto=format&fit=crop&w=1600&q=80',
   'published'),
  ('wildlife-photography-workshop','Wildlife Photography Workshop',
   'A three-day workshop with two award-winning photographers covering ethical wildlife photography, composition and post-processing.',
   'education',
   now() + interval '8 days' + interval '15 hours',
   now() + interval '10 days' + interval '17 hours',
   'Lewa House Learning Room','Lewa Education Programme',24,true,
   'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1600&q=80',
   'published'),
  ('ranger-open-day','Ranger Open Day',
   'Meet the anti-poaching team, tour the operations centre and see how technology protects wildlife 24/7.',
   'community',
   now() + interval '3 days' + interval '10 hours', null,
   'Rhino Monitoring Base','Lewa Security Team',null,false,
   'https://images.unsplash.com/photo-1516934024742-b461fba47600?auto=format&fit=crop&w=1600&q=80',
   'published'),
  ('community-tree-planting','Community Tree Planting',
   'Join community volunteers planting 3,000 indigenous seedlings along Lewa''s eastern boundary. Transport and lunch included.',
   'community',
   now() + interval '14 days' + interval '8 hours', null,
   'Ntugi Village','Community Development Programme',60,true,
   'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1600&q=80',
   'published')
on conflict (id) do update
  set title = excluded.title,
      description = excluded.description,
      event_type = excluded.event_type,
      start_at = excluded.start_at,
      end_at = excluded.end_at,
      location = excluded.location,
      organiser = excluded.organiser,
      capacity = excluded.capacity,
      registration_required = excluded.registration_required,
      image_url = excluded.image_url,
      status = excluded.status;

-- ---------------------------------------------------------------------------
-- Donation campaigns (KES pricing)
-- ---------------------------------------------------------------------------
insert into public.donation_campaigns (id, title, summary, description, story_paragraphs, impact, suggested_amounts, goal_amount, amount_raised, currency, cover_image, status, active)
values
  ('protect-a-rhino','Protect a Rhino',
   'Fund 24-hour anti-poaching for Lewa''s critically endangered black rhino.',
   'Lewa is one of the largest black rhino sanctuaries in East Africa. Every rhino here is monitored 24/7. Your gift keeps ranger patrols, vet care and tracking tech in the field.',
   array[
     'Lewa is one of the largest black rhino sanctuaries in East Africa. Every rhino here is monitored 24/7.',
     'Your donation directly funds ranger patrols, veterinary care and the tracking technology that keeps this population safe.'
   ],
   '[
     {"amount": 500,   "description": "One day of GPS tracker uptime for a rhino monitoring team."},
     {"amount": 2500,  "description": "Fuel and provisions for a full ranger patrol."},
     {"amount": 10000, "description": "Two-week ration for a K9 anti-poaching dog."}
   ]'::jsonb,
   array[500, 1000, 2500, 5000]::numeric[],
   32500000, 24400000, 'KES',
   'https://images.unsplash.com/photo-1567859667906-bafa2c14b4f2?auto=format&fit=crop&w=1600&q=80',
   'published', true),
  ('community-scholarships','Community Scholarships',
   'Send a student from a Lewa neighbouring community to secondary school.',
   'Lewa funds full scholarships for high-achieving students from surrounding communities. Alumni return as doctors, teachers and conservationists.',
   array[
     'Lewa funds full scholarships for high-achieving students from surrounding communities.',
     'Alumni have gone on to become doctors, lawyers, teachers and conservationists — many returning to work with the conservancy.'
   ],
   '[
     {"amount": 1500,  "description": "One month of full boarding fees for a secondary school student."},
     {"amount": 6000,  "description": "A full term of tuition, meals and accommodation."},
     {"amount": 25000, "description": "An entire academic year for one student."}
   ]'::jsonb,
   array[1000, 2500, 6000, 12000]::numeric[],
   7800000, 5500000, 'KES',
   'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80',
   'published', true),
  ('wildlife-corridors','Wildlife Corridors',
   'Keep the underpass and forest linkage open for elephants moving to Mount Kenya.',
   'The Mount Kenya elephant corridor connects Lewa to Africa''s second-highest peak. Ongoing maintenance and community stewardship keep the route safe.',
   array[
     'The Mount Kenya elephant corridor connects Lewa to Africa''s second-highest peak.',
     'Ongoing maintenance and community stewardship keep the route safe for elephants and other wildlife.'
   ],
   '[
     {"amount": 1000, "description": "One week of maintenance on the corridor fence line."},
     {"amount": 5000, "description": "A month of monitoring by a corridor scout."}
   ]'::jsonb,
   array[1000, 2500, 5000, 12000]::numeric[],
   19500000, 4160000, 'KES',
   'https://images.unsplash.com/photo-1509909756405-be0199881695?auto=format&fit=crop&w=1600&q=80',
   'published', true)
on conflict (id) do update
  set title = excluded.title,
      summary = excluded.summary,
      description = excluded.description,
      story_paragraphs = excluded.story_paragraphs,
      impact = excluded.impact,
      suggested_amounts = excluded.suggested_amounts,
      goal_amount = excluded.goal_amount,
      amount_raised = excluded.amount_raised,
      currency = excluded.currency,
      cover_image = excluded.cover_image,
      status = excluded.status,
      active = excluded.active;

-- ---------------------------------------------------------------------------
-- Conservation programs / education resources / community programs
-- ---------------------------------------------------------------------------
insert into public.conservation_programs (id, title, summary, category, cover_image, status)
values
  ('anti-poaching','Anti-poaching Operations','24/7 field patrols, rapid response, canine unit and aerial surveillance.','Wildlife','https://images.unsplash.com/photo-1516934024742-b461fba47600?auto=format&fit=crop&w=1200&q=80','published'),
  ('community-health','Community Health','Four clinics serving 40,000 neighbours with maternal, child and preventive care.','Community','https://images.unsplash.com/photo-1519824145371-296894a0daa9?auto=format&fit=crop&w=1200&q=80','published'),
  ('wildlife-corridors','Wildlife Corridors','Protecting the elephant corridor that links Lewa to Mount Kenya National Park.','Habitat','https://images.unsplash.com/photo-1509909756405-be0199881695?auto=format&fit=crop&w=1200&q=80','published'),
  ('research-monitoring','Research & Monitoring','Long-term studies of rhino, Grevy''s zebra and predator populations.','Research','https://images.unsplash.com/photo-1567859667906-bafa2c14b4f2?auto=format&fit=crop&w=1200&q=80','published')
on conflict (id) do update
  set title = excluded.title, summary = excluded.summary, category = excluded.category,
      cover_image = excluded.cover_image, status = excluded.status;

insert into public.education_resources (id, title, summary, category, cover_image, reading_minutes, status)
values
  ('e-01','Why the Grevy''s zebra matters','Understanding the biology, threats and hope for the world''s most endangered zebra.','Wildlife','https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80',6,'published'),
  ('e-02','How Lewa protects a rhino','Step inside the operations centre that keeps every rhino safe, 24 hours a day.','Conservation','https://images.unsplash.com/photo-1567859667906-bafa2c14b4f2?auto=format&fit=crop&w=1200&q=80',8,'published'),
  ('e-03','The Mount Kenya elephant corridor','The story of how a fence, an underpass and a community made history for wildlife.','Conservation','https://images.unsplash.com/photo-1509909756405-be0199881695?auto=format&fit=crop&w=1200&q=80',7,'published'),
  ('e-04','Living alongside wildlife','How Lewa''s community programmes turn conservation into shared opportunity.','Community','https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80',5,'published')
on conflict (id) do update
  set title = excluded.title, summary = excluded.summary, category = excluded.category,
      cover_image = excluded.cover_image, reading_minutes = excluded.reading_minutes, status = excluded.status;

insert into public.community_programs (id, title, summary, description, cover_image, sort_order, status)
values
  ('community-health-c','Community Health','Four clinics serving over 40,000 people in neighbouring communities.','Reproductive, child and preventive care across Lewa''s neighbour communities.','https://images.unsplash.com/photo-1519824145371-296894a0daa9?auto=format&fit=crop&w=1200&q=80',1,'published'),
  ('education-c','Education','School bursaries and infrastructure support across 21 partner schools.','From classrooms and dormitories to full scholarships for high-achieving students.','https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',2,'published'),
  ('water-c','Water','Reliable, safe drinking water for households and livestock.','Boreholes, storage tanks and piped supply to reduce human-wildlife conflict.','https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80',3,'published'),
  ('enterprise-c','Enterprise','Livelihoods programmes for women''s groups and youth entrepreneurs.','Beadwork, honey, aloe and eco-tourism enterprises that make conservation pay.','https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80',4,'published')
on conflict (id) do update
  set title = excluded.title, summary = excluded.summary, description = excluded.description,
      cover_image = excluded.cover_image, sort_order = excluded.sort_order, status = excluded.status;

-- ---------------------------------------------------------------------------
-- Announcements
-- ---------------------------------------------------------------------------
insert into public.announcements (id, title, body, tone, publish_at, status, priority)
values
  ('a-001','Rangers rescue snared elephant','Our security and veterinary teams safely removed a snare from a young bull elephant near the Ngare Ndare corridor.','default', now() - interval '6 hours','published',0),
  ('a-002','Northern gate closure','The northern gate is closed for maintenance until Friday. Please use the main gate for entry.','urgent', now() - interval '20 hours','published',10),
  ('a-003','Corridor use hits five-year high','Camera-trap data shows elephant use of the Mount Kenya corridor is up 38% year on year.','default', now() - interval '48 hours','published',0)
on conflict (id) do update
  set title = excluded.title, body = excluded.body, tone = excluded.tone,
      publish_at = excluded.publish_at, status = excluded.status, priority = excluded.priority;

-- ---------------------------------------------------------------------------
-- FAQs
-- ---------------------------------------------------------------------------
insert into public.faqs (id, category, question, answer, sort_order, status)
values
  ('f-01','General','What is Lewa Wildlife Conservancy?','Lewa is a UNESCO World Heritage Site in northern Kenya that protects endangered species, safeguards ecosystems and supports neighbouring communities.',1,'published'),
  ('f-02','General','When is the best time to visit?','Lewa is a year-round destination. June to October and January to March typically offer the best wildlife viewing.',2,'published'),
  ('f-03','Bookings','How do I confirm my booking?','Your booking is confirmed once we receive payment. You will see the status update in the app and receive a confirmation email.',1,'published'),
  ('f-04','Bookings','What is your cancellation policy?','Free cancellation up to 72 hours before your booking. Within 72 hours, a 50% fee applies. No-shows are non-refundable.',2,'published'),
  ('f-05','Payments','Which payment methods are supported?','We accept card and M-Pesa payments in Kenyan Shillings through our secure Paystack partner. Confirmations are always verified server-side.',1,'published'),
  ('f-06','Account','How do I change my notification preferences?','Open the Profile tab, tap Notification preferences, then adjust which channels and topics you want to hear about.',1,'published')
on conflict (id) do update
  set category = excluded.category, question = excluded.question, answer = excluded.answer,
      sort_order = excluded.sort_order, status = excluded.status;

-- ---------------------------------------------------------------------------
-- About content
-- ---------------------------------------------------------------------------
insert into public.about_content (key, title, body, sort_order)
values
  ('mission','Our mission','Lewa Wildlife Conservancy works as a catalyst for the conservation of wildlife and its habitat. We do this through the protection and management of species, the initiation and support of community conservation and development programmes, and the education of neighbours and community members in the value of wildlife.',1),
  ('history','A brief history','Founded in 1995, Lewa became a UNESCO World Heritage Site as part of the Mount Kenya complex. Our 62,000-acre landscape is a black-rhino sanctuary and a critical stronghold for Grevy''s zebra.',2),
  ('impact','Impact today','Lewa runs four community clinics, 21 partner schools, and 24/7 anti-poaching operations. Every visit and every gift funds the field teams and community programmes that keep this place wild.',3),
  ('contact','Get in touch','Lewa Wildlife Conservancy, P.O. Box 1121-10100, Nanyuki, Kenya. Email info@lewa.org.',4)
on conflict (key) do update
  set title = excluded.title, body = excluded.body, sort_order = excluded.sort_order;
