-- M4 · Calendar feed (ICS). The token is a capability: whoever has the URL can read
-- the space's schedule (titles hidden unless calendar_show_titles). No service key needed.

create or replace function public.set_calendar_feed(sid uuid, enabled boolean)
returns text language plpgsql security definer set search_path = public as $$
declare tok text;
begin
  if not public.is_member(sid) then raise exception 'not a member'; end if;
  tok := case when enabled then encode(extensions.gen_random_bytes(24), 'hex') else null end;
  update public.spaces set calendar_token = tok where id = sid;
  return tok;
end $$;
revoke all on function public.set_calendar_feed(uuid, boolean) from public, anon;
grant execute on function public.set_calendar_feed(uuid, boolean) to authenticated;

create or replace function public.calendar_feed(token text)
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'name', s.name,
    'due_date', s.due_date,
    'show_titles', s.calendar_show_titles,
    'appointments', coalesce((select json_agg(json_build_object(
        'id', a.id, 'title', a.title, 'kind', a.kind, 'starts_at', a.starts_at,
        'provider', a.provider, 'location', a.location, 'updated_at', a.updated_at))
      from public.appointments a
      where a.space_id = s.id and a.starts_at is not null and a.status in ('scheduled','pending','completed')
        and a.starts_at > now() - interval '120 days'), '[]'::json),
    'tasks', coalesce((select json_agg(json_build_object(
        'id', t.id, 'title', t.title, 'due_date', t.due_date, 'created_at', t.created_at))
      from public.tasks t
      where t.space_id = s.id and not t.done and t.due_date is not null), '[]'::json)
  )
  from public.spaces s
  where token is not null and length(token) >= 32 and s.calendar_token = token
$$;
revoke all on function public.calendar_feed(text) from public;
grant execute on function public.calendar_feed(text) to anon, authenticated;
