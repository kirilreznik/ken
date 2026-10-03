-- How many weeks before a test window opens the couple wants to book (default 3).
-- Used when the plan doesn't say "לקבוע עד שבוע X" (appointments.book_by_week stays null).
alter table public.spaces add column if not exists booking_lead_weeks int not null default 3 check (booking_lead_weeks between 1 and 8);
