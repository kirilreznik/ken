-- קן · M1: baby prep, birth plan, contacts, journal, smart-checklist state, notifications, media bucket

-- ───────────── Space-level settings ─────────────
alter table public.spaces
  add column if not exists prep_budget numeric(10,2),
  add column if not exists calendar_token text unique,
  add column if not exists calendar_show_titles boolean not null default false,
  add column if not exists ai_reading_enabled boolean not null default false;

-- ───────────── Baby prep ─────────────
create table public.prep_items (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  title text not null,
  category text not null default 'misc'
    check (category in ('stroller','car_seat','sleep','clothes','bath','feeding','nursery','birth_bag','misc')),
  status text not null default 'need' check (status in ('need','reviewing','chosen','bought','not_needed')),
  price numeric(10,2),
  url text,
  notes text,
  recommended_by text,
  image_path text,
  compare_group text,
  quantity int not null default 1,
  sort double precision not null default extract(epoch from now()),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.prep_items (space_id, category, sort);

-- ───────────── Birth plan (one per space) ─────────────
create table public.birth_plans (
  space_id uuid primary key references public.spaces(id) on delete cascade,
  hospital_name text,
  hospital_ward text,
  hospital_phone text,
  hospital_address text,
  tour_at timestamptz,
  registration_done boolean not null default false,
  caregiver_name text,
  caregiver_phone text,
  doula_status text,
  route_notes text,
  parking text,
  travel_minutes_free int,
  travel_minutes_peak int,
  preferences text[] not null default '{}',
  preferences_note text,
  updated_at timestamptz not null default now()
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  name text not null,
  role text,
  phone text,
  sort double precision not null default extract(epoch from now()),
  created_at timestamptz not null default now()
);
create index on public.contacts (space_id, sort);

alter table public.documents
  add column if not exists pinned_for_birth boolean not null default false,
  add column if not exists ai_status text check (ai_status in ('pending','done','failed','dismissed')),
  add column if not exists ai_suggestion jsonb;

-- Tasks can be scheduled to a pregnancy week (birth checklist, smart suggestions)
alter table public.tasks
  add column if not exists due_week int,
  add column if not exists source_key text;

-- ───────────── Journal ─────────────
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  author uuid not null references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  kind text not null default 'note' check (kind in ('note','milestone','ultrasound','photo')),
  title text,
  body text,
  photos text[] not null default '{}',
  visibility text not null default 'shared' check (visibility in ('shared','private')),
  hidden boolean not null default false,
  include_in_book boolean not null default true,
  appointment_id uuid references public.appointments(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.journal_entries (space_id, entry_date desc);

-- ───────────── Smart checklist state ─────────────
create table public.suggestion_states (
  space_id uuid not null references public.spaces(id) on delete cascade,
  key text not null,
  status text not null check (status in ('added','dismissed')),
  updated_at timestamptz not null default now(),
  primary key (space_id, key)
);

-- ───────────── Notifications ─────────────
create table public.notification_prefs (
  user_id uuid primary key references auth.users(id) on delete cascade,
  space_id uuid not null references public.spaces(id) on delete cascade,
  push_enabled boolean not null default false,
  appointment_reminders boolean not null default true,
  task_reminders boolean not null default true,
  window_reminders boolean not null default true,
  suggestion_reminders boolean not null default true,
  weekly_summary boolean not null default true,
  timezone text not null default 'Asia/Jerusalem',
  updated_at timestamptz not null default now()
);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  space_id uuid not null references public.spaces(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  last_success_at timestamptz,
  failure_count int not null default 0
);

-- Server-only (no client policies): de-duplicates sent notifications.
create table public.notification_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  ref_key text not null,
  sent_at timestamptz not null default now(),
  unique (user_id, kind, ref_key)
);

-- ───────────── RLS ─────────────
alter table public.prep_items enable row level security;
alter table public.birth_plans enable row level security;
alter table public.contacts enable row level security;
alter table public.journal_entries enable row level security;
alter table public.suggestion_states enable row level security;
alter table public.notification_prefs enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.notification_log enable row level security;

do $$
declare t text;
begin
  foreach t in array array['prep_items','birth_plans','contacts','suggestion_states'] loop
    execute format('create policy "members all %1$s" on public.%1$I for all using (public.is_member(space_id)) with check (public.is_member(space_id));', t);
  end loop;
end $$;

-- Journal: shared entries visible to both; private entries only to the author.
create policy "journal read" on public.journal_entries for select
  using (public.is_member(space_id) and (visibility = 'shared' or author = auth.uid()));
create policy "journal insert" on public.journal_entries for insert
  with check (public.is_member(space_id) and author = auth.uid());
create policy "journal update" on public.journal_entries for update
  using (public.is_member(space_id) and (visibility = 'shared' or author = auth.uid()))
  with check (public.is_member(space_id) and (visibility = 'shared' or author = auth.uid()));
create policy "journal delete" on public.journal_entries for delete
  using (public.is_member(space_id) and author = auth.uid());

create policy "own prefs" on public.notification_prefs for all
  using (user_id = auth.uid()) with check (user_id = auth.uid() and public.is_member(space_id));
create policy "own push subs" on public.push_subscriptions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid() and public.is_member(space_id));

-- ───────────── Media bucket (prep images, journal photos) ─────────────
insert into storage.buckets (id, name, public) values ('media', 'media', false) on conflict (id) do nothing;
create policy "members read media" on storage.objects for select
  using (bucket_id = 'media' and public.is_member(((storage.foldername(name))[1])::uuid));
create policy "members upload media" on storage.objects for insert
  with check (bucket_id = 'media' and public.is_member(((storage.foldername(name))[1])::uuid));
create policy "members update media" on storage.objects for update
  using (bucket_id = 'media' and public.is_member(((storage.foldername(name))[1])::uuid));
create policy "members delete media" on storage.objects for delete
  using (bucket_id = 'media' and public.is_member(((storage.foldername(name))[1])::uuid));

alter publication supabase_realtime add table public.prep_items, public.birth_plans, public.contacts, public.journal_entries, public.suggestion_states;
