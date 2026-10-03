-- קן · initial schema
-- Run in Supabase SQL editor (or `supabase db push`).

create extension if not exists pgcrypto;

-- ───────────── Spaces (one per couple / pregnancy) ─────────────
create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'ההריון שלנו',
  due_date date not null,
  palette text not null default 'neutral' check (palette in ('neutral','girl','boy')),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.space_members (
  space_id uuid not null references public.spaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  joined_at timestamptz not null default now(),
  primary key (space_id, user_id)
);

create table public.space_invites (
  code text primary key,
  space_id uuid not null references public.spaces(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null default now() + interval '7 days',
  used_by uuid references auth.users(id),
  used_at timestamptz
);

create or replace function public.is_member(sid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.space_members where space_id = sid and user_id = auth.uid());
$$;

-- ───────────── Medical: appointments & tests ─────────────
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  title text not null,
  kind text not null default 'doctor'
    check (kind in ('doctor','ultrasound','blood','genetic','medical','other')),
  status text not null default 'scheduled'
    check (status in ('future','need','scheduled','done','pending','completed')),
  starts_at timestamptz,
  window_start_week int,
  window_end_week int,
  provider text,
  location text,
  medical_notes text,
  personal_note text,
  result_summary text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.appointments (space_id, starts_at);

-- ───────────── Documents ─────────────
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  title text not null,
  category text not null default 'other'
    check (category in ('blood','ultrasound','scan','genetic','referral','summary','receipt','other')),
  doc_date date not null default current_date,
  provider text,
  note text,
  tags text[] not null default '{}',
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  appointment_id uuid references public.appointments(id) on delete set null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index on public.documents (space_id, doc_date desc);

-- ───────────── Tasks ─────────────
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  title text not null,
  category text not null default 'pregnancy'
    check (category in ('medical','pregnancy','admin','baby','home','birth')),
  due_date date,
  priority text not null default 'normal' check (priority in ('urgent','high','normal','low')),
  notes text,
  trimester int check (trimester between 1 and 3),
  assignee uuid references auth.users(id),
  appointment_id uuid references public.appointments(id) on delete set null,
  document_id uuid references public.documents(id) on delete set null,
  done boolean not null default false,
  done_at timestamptz,
  done_by uuid references auth.users(id),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index on public.tasks (space_id, done, due_date);

-- ───────────── Questions for the doctor ─────────────
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  text text not null,
  category text,
  week int,
  appointment_id uuid references public.appointments(id) on delete set null,
  answer text,
  resolved boolean not null default false,
  sort double precision not null default extract(epoch from now()),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index on public.questions (space_id, resolved, sort);

-- ───────────── RLS ─────────────
alter table public.spaces enable row level security;
alter table public.space_members enable row level security;
alter table public.space_invites enable row level security;
alter table public.appointments enable row level security;
alter table public.documents enable row level security;
alter table public.tasks enable row level security;
alter table public.questions enable row level security;

create policy "members read space" on public.spaces for select using (public.is_member(id));
create policy "members update space" on public.spaces for update using (public.is_member(id));

create policy "members read members" on public.space_members for select using (public.is_member(space_id));
create policy "member updates self" on public.space_members for update using (user_id = auth.uid());

create policy "members read invites" on public.space_invites for select using (public.is_member(space_id));
create policy "members create invites" on public.space_invites for insert
  with check (public.is_member(space_id) and created_by = auth.uid());

do $$
declare t text;
begin
  foreach t in array array['appointments','documents','tasks','questions'] loop
    execute format('create policy "members all %1$s" on public.%1$I for all using (public.is_member(space_id)) with check (public.is_member(space_id));', t);
  end loop;
end $$;

-- ───────────── RPCs ─────────────
create or replace function public.create_space(p_name text, p_due_date date, p_display_name text)
returns uuid language plpgsql security definer set search_path = public as $$
declare sid uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  insert into public.spaces (name, due_date, created_by) values (coalesce(nullif(p_name,''),'ההריון שלנו'), p_due_date, auth.uid())
    returning id into sid;
  insert into public.space_members (space_id, user_id, display_name) values (sid, auth.uid(), p_display_name);
  return sid;
end $$;

create or replace function public.join_space(p_code text, p_display_name text)
returns uuid language plpgsql security definer set search_path = public as $$
declare inv public.space_invites;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select * into inv from public.space_invites
    where code = upper(trim(p_code)) and used_by is null and expires_at > now() for update;
  if not found then raise exception 'invalid_code'; end if;
  insert into public.space_members (space_id, user_id, display_name)
    values (inv.space_id, auth.uid(), p_display_name) on conflict do nothing;
  update public.space_invites set used_by = auth.uid(), used_at = now() where code = inv.code;
  return inv.space_id;
end $$;

revoke execute on function public.is_member(uuid) from public, anon;
grant execute on function public.is_member(uuid) to authenticated;
revoke execute on function public.create_space(text, date, text) from public, anon;
revoke execute on function public.join_space(text, text) from public, anon;
grant execute on function public.create_space(text, date, text) to authenticated;
grant execute on function public.join_space(text, text) to authenticated;

-- ───────────── Storage ─────────────
insert into storage.buckets (id, name, public) values ('documents', 'documents', false)
  on conflict (id) do nothing;

create policy "members read files" on storage.objects for select
  using (bucket_id = 'documents' and public.is_member(((storage.foldername(name))[1])::uuid));
create policy "members upload files" on storage.objects for insert
  with check (bucket_id = 'documents' and public.is_member(((storage.foldername(name))[1])::uuid));
create policy "members update files" on storage.objects for update
  using (bucket_id = 'documents' and public.is_member(((storage.foldername(name))[1])::uuid));
create policy "members delete files" on storage.objects for delete
  using (bucket_id = 'documents' and public.is_member(((storage.foldername(name))[1])::uuid));

-- ───────────── Realtime (both partners see changes live) ─────────────
alter publication supabase_realtime add table public.appointments, public.documents, public.tasks, public.questions, public.spaces;
