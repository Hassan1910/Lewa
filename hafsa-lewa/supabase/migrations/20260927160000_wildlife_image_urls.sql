-- Each species uses one photo for the card and the detail hero.
-- Card and hero differ only by width so the picture you tap is the picture you open.

update public.wildlife_species as s
set
  image_url = v.image_url,
  hero_image_url = v.hero_image_url
from (
  values
    (
      'grevys-zebra',
      'https://images.unsplash.com/photo-1535076404789-9c49ee899990?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1535076404789-9c49ee899990?auto=format&fit=crop&w=1600&q=80'
    ),
    (
      'black-rhino',
      'https://images.unsplash.com/photo-1711709377447-a4c63ce1bcbc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1711709377447-a4c63ce1bcbc?auto=format&fit=crop&w=1600&q=80'
    ),
    (
      'reticulated-giraffe',
      'https://images.unsplash.com/photo-1547721064-da6cfb341d50?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1547721064-da6cfb341d50?auto=format&fit=crop&w=1600&q=80'
    ),
    (
      'african-elephant',
      'https://images.unsplash.com/photo-1586584535372-2ec07cdb83ff?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1586584535372-2ec07cdb83ff?auto=format&fit=crop&w=1600&q=80'
    ),
    (
      'lion',
      'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1600&q=80'
    ),
    (
      'african-wild-dog',
      'https://images.unsplash.com/photo-1759145223102-a0982d8161e0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1759145223102-a0982d8161e0?auto=format&fit=crop&w=1600&q=80'
    ),
    (
      'kori-bustard',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Kori_bustard_%28Ardeotis_kori%29.jpg/1280px-Kori_bustard_%28Ardeotis_kori%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Kori_bustard_%28Ardeotis_kori%29.jpg/1920px-Kori_bustard_%28Ardeotis_kori%29.jpg'
    )
) as v(id, image_url, hero_image_url)
where s.id = v.id;
