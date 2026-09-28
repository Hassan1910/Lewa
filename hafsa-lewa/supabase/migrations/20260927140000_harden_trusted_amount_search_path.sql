-- Pin search_path when the function already exists.
-- A fresh run creates it in 20260927210000_availability_cancel.sql,
-- with search_path already set, so this step must not require it.
do $$
begin
  if to_regprocedure('public.bookings_set_trusted_amount()') is not null then
    execute 'alter function public.bookings_set_trusted_amount() set search_path = public';
  end if;
end $$;
