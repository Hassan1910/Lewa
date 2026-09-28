-- Replace Unsplash stock with photographs published on Wikimedia Commons
-- in Category:Lewa Wildlife Conservancy. Lion and wild dog stay as-is:
-- that category has no photograph of those species at Lewa.

update public.wildlife_species
set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/The_Lewa_Zebra_-_panoramio.jpg/1280px-The_Lewa_Zebra_-_panoramio.jpg',
    hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/The_Lewa_Zebra_-_panoramio.jpg/1920px-The_Lewa_Zebra_-_panoramio.jpg'
where id = 'grevys-zebra';

update public.wildlife_species
set image_url = 'https://upload.wikimedia.org/wikipedia/commons/7/70/Black_Rhinos_Kenya.jpg',
    hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/7/70/Black_Rhinos_Kenya.jpg'
where id = 'black-rhino';

update public.wildlife_species
set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Giraffa_camelopardalis-Lewa_Kenya.jpg/1280px-Giraffa_camelopardalis-Lewa_Kenya.jpg',
    hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Giraffa_camelopardalis-Lewa_Kenya.jpg/1920px-Giraffa_camelopardalis-Lewa_Kenya.jpg'
where id = 'reticulated-giraffe';

update public.wildlife_species
set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Mother_Elephant.jpg/1280px-Mother_Elephant.jpg',
    hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Mother_Elephant.jpg/1920px-Mother_Elephant.jpg'
where id = 'african-elephant';

update public.tourism_services
set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/The_Lewa_Zebra_-_panoramio.jpg/1280px-The_Lewa_Zebra_-_panoramio.jpg',
    hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Lewa_Wildlife_Conservancy.jpg/1920px-Lewa_Wildlife_Conservancy.jpg'
where id = 'sunrise-game-drive';

update public.tourism_services
set image_url = 'https://upload.wikimedia.org/wikipedia/commons/7/70/Black_Rhinos_Kenya.jpg',
    hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/7/70/Black_Rhinos_Kenya.jpg'
where id = 'rhino-tracking-walk';

update public.tourism_services
set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Lewa_Wildlife_Conservancy.jpg/1280px-Lewa_Wildlife_Conservancy.jpg',
    hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Lewa_Wildlife_Conservancy.jpg/1920px-Lewa_Wildlife_Conservancy.jpg'
where id = 'lewa-safari-camp';

update public.tourism_services
set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Road_to_Lewa_%28Kenya%29.jpg/1280px-Road_to_Lewa_%28Kenya%29.jpg',
    hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Road_to_Lewa_%28Kenya%29.jpg/1920px-Road_to_Lewa_%28Kenya%29.jpg'
where id = 'community-market-visit';

update public.tourism_services
set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Impala_%2832163044688%29.jpg/1280px-Impala_%2832163044688%29.jpg',
    hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Impala_%2832163044688%29.jpg/1920px-Impala_%2832163044688%29.jpg'
where id = 'guided-nature-walk';

update public.tourism_services
set image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Road_to_Lewa_%28Kenya%29.jpg/1280px-Road_to_Lewa_%28Kenya%29.jpg',
    hero_image_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Road_to_Lewa_%28Kenya%29.jpg/1920px-Road_to_Lewa_%28Kenya%29.jpg'
where id = 'ngare-ndare-forest-day-trip';

update public.education_resources
set cover_image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/The_Lewa_Zebra_-_panoramio.jpg/1280px-The_Lewa_Zebra_-_panoramio.jpg'
where id = 'e-01';

update public.education_resources
set cover_image = 'https://upload.wikimedia.org/wikipedia/commons/7/70/Black_Rhinos_Kenya.jpg'
where id = 'e-02';

update public.education_resources
set cover_image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Mother_Elephant.jpg/1280px-Mother_Elephant.jpg'
where id = 'e-03';

update public.education_resources
set cover_image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Lewa_Wildlife_Conservancy.jpg/1280px-Lewa_Wildlife_Conservancy.jpg'
where id = 'e-04';

update public.donation_campaigns
set cover_image = 'https://upload.wikimedia.org/wikipedia/commons/7/70/Black_Rhinos_Kenya.jpg'
where id = 'protect-a-rhino';
