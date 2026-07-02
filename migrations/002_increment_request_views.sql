-- Sellers can't UPDATE car_requests under RLS (buyers manage own rows only),
-- so view counting goes through a SECURITY DEFINER function. Skips the
-- request owner viewing their own request.
-- Apply with: Supabase SQL editor or `supabase db push` (not yet applied).
create or replace function public.increment_request_views(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.car_requests
     set view_count = view_count + 1
   where id = p_request_id
     and buyer_id is distinct from auth.uid();
end;
$$;

revoke all on function public.increment_request_views(uuid) from public;
grant execute on function public.increment_request_views(uuid) to authenticated;
