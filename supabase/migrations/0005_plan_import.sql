-- Onboarding + pregnancy plan import (AI or standard Israeli schedule).

-- Who is who (both partners stay equal editors; the role only shapes wording).
alter table public.space_members add column if not exists role text check (role in ('pregnant','partner'));

-- When to book, and where an appointment came from.
alter table public.appointments
  add column if not exists book_by_week int,
  add column if not exists source text check (source in ('plan','standard','manual')),
  add column if not exists plan_document_id uuid references public.documents(id) on delete set null;

-- New document category for the follow-up plan itself.
alter table public.documents drop constraint documents_category_check,
  add constraint documents_category_check check (category in ('blood','ultrasound','scan','genetic','referral','summary','receipt','plan','other'));

-- One row per import attempt; the analyze-plan Edge Function fills `result`, the app reviews and applies it.
create table if not exists public.plan_imports (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces(id) on delete cascade,
  document_ids uuid[] not null default '{}',
  source text not null default 'document' check (source in ('document','standard')),
  status text not null default 'pending' check (status in ('pending','ready','applied','failed')),
  result jsonb,
  error text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.plan_imports enable row level security;
create policy "members all plan_imports" on public.plan_imports for all
  using (public.is_member(space_id)) with check (public.is_member(space_id));
create index if not exists plan_imports_space on public.plan_imports(space_id, created_at desc);
alter publication supabase_realtime add table public.plan_imports;
