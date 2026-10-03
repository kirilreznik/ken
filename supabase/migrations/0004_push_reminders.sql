-- M5/M6 · Push reminders + weekly summary.
-- Secrets live in Supabase Vault (created once, outside this file):
--   vapid_public, vapid_private, vapid_subject, notify_cron_secret
-- The `notify` Edge Function (verify_jwt = false; it checks the cron secret or a user JWT itself)
-- is invoked every 15 minutes by pg_cron through pg_net.

create extension if not exists pg_net;
create extension if not exists pg_cron;

-- Config for the Edge Function only (service_role).
create or replace function public.notify_config()
returns json language sql stable security definer set search_path = public, vault as $$
  select json_build_object(
    'vapid_public',  (select decrypted_secret from vault.decrypted_secrets where name = 'vapid_public'),
    'vapid_private', (select decrypted_secret from vault.decrypted_secrets where name = 'vapid_private'),
    'vapid_subject', (select decrypted_secret from vault.decrypted_secrets where name = 'vapid_subject'),
    'cron_secret',   (select decrypted_secret from vault.decrypted_secrets where name = 'notify_cron_secret'))
$$;
revoke all on function public.notify_config() from public, anon, authenticated;
grant execute on function public.notify_config() to service_role;

-- Register this browser's push subscription for the current user (moves it if another user had it).
create or replace function public.register_push(sid uuid, p_endpoint text, p_p256dh text, p_auth text, p_ua text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.is_member(sid) then raise exception 'not a member'; end if;
  insert into public.push_subscriptions (user_id, space_id, endpoint, p256dh, auth, user_agent)
  values (auth.uid(), sid, p_endpoint, p_p256dh, p_auth, left(p_ua, 300))
  on conflict (endpoint) do update set user_id = excluded.user_id, space_id = excluded.space_id,
    p256dh = excluded.p256dh, auth = excluded.auth, user_agent = excluded.user_agent, failure_count = 0;
end $$;
revoke all on function public.register_push(uuid, text, text, text, text) from public, anon;
grant execute on function public.register_push(uuid, text, text, text, text) to authenticated;

-- Every 15 minutes; the function decides per user/timezone what is due and dedupes via notification_log.
select cron.schedule('ken-notify', '*/15 * * * *', $cron$
  select net.http_post(
    url := 'https://nxskkpcjyqjtgccnemgu.supabase.co/functions/v1/notify',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'notify_cron_secret')),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000)
$cron$);

-- Optional housekeeping (not applied yet — run once from the SQL editor if the log grows):
-- select cron.schedule('ken-notify-log-trim', '17 3 * * *',
--   $$ delete from public.notification_log where sent_at < now() - interval '120 days' $$);
