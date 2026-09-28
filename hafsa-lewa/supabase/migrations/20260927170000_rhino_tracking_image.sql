-- The previous Unsplash id for Rhino Tracking Walk returns 404, so the
-- home card and detail hero fall back to the placeholder icon.
-- Card and hero differ only by width so the picture you tap is the picture you open.

update public.tourism_services
set
  image_url = 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1200&q=80',
  hero_image_url = 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1600&q=80'
where id = 'rhino-tracking-walk';
