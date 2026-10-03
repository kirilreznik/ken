# קן — Pregnancy OS

Private, Hebrew/RTL, offline-first PWA for an expecting couple.
Next.js 16 · React 19 · Tailwind 4 · Supabase · TanStack Query (persisted to IndexedDB).

## Setup

1. `npm install`
2. Fill `.env.local` (see `.env.example`) with your Supabase **Project URL** and **anon public key**
   (Supabase → Project Settings → API).
3. Supabase → SQL Editor → paste and run `supabase/migrations/0001_init.sql`.
4. Supabase → Authentication → Providers → Email: enabled. For quick local testing you can
   turn off "Confirm email"; otherwise each sign-up gets a confirmation mail.
5. `npm run dev` → http://localhost:3000

First user: sign up → onboarding (name + due date, optional standard Israeli test checklist).
Partner: Settings → "יצירת קוד הזמנה" → partner signs up → "יש לי קוד הזמנה".

## Deploy (Vercel)

Import the repo, add the two `NEXT_PUBLIC_SUPABASE_*` env vars, deploy.
Add your Vercel domain to Supabase → Authentication → URL Configuration (Site URL / Redirect URLs).
Install on phones: iPhone Safari → Share → "הוספה למסך הבית"; Android Chrome → Install.

## How it's built

- `src/lib/pregnancy.ts` — week math from the due date (weeks, trimester, %), size/development copy, standard test windows.
- `src/lib/data.ts` — query hooks + `useSave(table)` (optimistic insert/update/delete).
  Mutations made offline are paused, persisted, and replayed on reconnect.
- `src/lib/uploads.ts` — document upload queue in IndexedDB (works offline, retries).
- `src/lib/session.tsx` — auth + the couple's shared space; palette (neutral / girl / boy) applied to `<html data-palette>`.
- `public/sw.js` — app shell + static asset cache; "update available" banner via `src/lib/sw.ts`.
  Only registered in production builds (`npm run build && npm start`).
- Realtime: both partners see changes live (Supabase Realtime on all tables).
- Design tokens: `src/app/globals.css` (three palettes as CSS variables).

## Roadmap

Done (MVP): Home, Timeline, Tests & appointments, Documents, Tasks, Questions + visit mode, Settings/sharing, PWA/offline.
Next: Baby prep, Calendar, Birth planning, Journal (placeholders exist at /prep, /calendar, /birth, /journal).
