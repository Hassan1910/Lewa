-- Pin the booking amount trigger so it cannot be hijacked via search_path.
alter function public.bookings_set_trusted_amount() set search_path = public;
