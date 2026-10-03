-- Baby-prep shopping: share a link / screenshot into Ken → AI triage → item or extra store offer.

alter table public.prep_items
  add column if not exists brand text,
  add column if not exists model text,
  add column if not exists source text check (source in ('manual','share','default'));

-- Where to buy: one row per store/variant for an item (price comparison).
create table if not exists public.prep_offers (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  item_id uuid not null references public.prep_items(id) on delete cascade,
  store text,
  url text,
  price numeric(10,2),
  currency text not null default 'ILS',
  variant text,
  note text,
  image_url text,
  source text not null default 'manual' check (source in ('manual','share')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists prep_offers_item on public.prep_offers(item_id);
alter table public.prep_offers enable row level security;
create policy "members all prep_offers" on public.prep_offers for all
  using (public.is_member(space_id)) with check (public.is_member(space_id));

-- Everything shared into the app; the triage-product Edge Function fills result/action.
create table if not exists public.prep_inbox (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  created_by uuid references auth.users(id),
  url text,
  text text,
  image_path text,
  via text not null default 'app' check (via in ('app','android','shortcut')),
  status text not null default 'pending' check (status in ('pending','done','failed','undone')),
  action text check (action in ('new','offer','fill')),
  item_id uuid references public.prep_items(id) on delete set null,
  offer_id uuid references public.prep_offers(id) on delete set null,
  result jsonb,
  error text,
  dismissed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists prep_inbox_space on public.prep_inbox(space_id, created_at desc);
alter table public.prep_inbox enable row level security;
create policy "members all prep_inbox" on public.prep_inbox for all
  using (public.is_member(space_id)) with check (public.is_member(space_id));

-- Personal token for the iPhone Shortcut (share sheet → Edge Function, no login in Shortcuts).
create table if not exists public.capture_tokens (
  token text primary key check (length(token) >= 32),
  user_id uuid not null references auth.users(id) on delete cascade,
  space_id uuid not null references public.spaces(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);
alter table public.capture_tokens enable row level security;
create policy "own capture tokens" on public.capture_tokens for all
  using (user_id = auth.uid()) with check (user_id = auth.uid() and public.is_member(space_id));

alter publication supabase_realtime add table public.prep_offers, public.prep_inbox;
