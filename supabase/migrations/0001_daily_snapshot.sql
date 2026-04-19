-- Single-row-per-day snapshot of all daily-tier data.
-- Upserted by Vercel Cron at 06:00 PHT daily.

create table if not exists public.daily_snapshot (
  snapshot_date   date primary key,
  generated_at    timestamptz not null default now(),
  pump_price      jsonb,          -- { value, delta, source, sourceUrl }
  asean_prices    jsonb,          -- [{ country, price, rank }]
  stations        jsonb,          -- { operational, lowStock, closed, total }
  supply_days     jsonb,          -- { value, delta, basis }
  narrative       jsonb           -- { headline, body, signals }
);

comment on table public.daily_snapshot is 'Daily refresh of PH fuel crisis factual data. One row per day, overwritten on re-run.';

-- Read-only public access for client components.
alter table public.daily_snapshot enable row level security;

create policy "public read access"
  on public.daily_snapshot
  for select
  using (true);

-- Permissive write policies for the cron pipeline.
-- Protection: /api/daily/refresh endpoint guards with CRON_SECRET Bearer token.
-- Table is single-row-per-date, overwritten daily, contains only public factual data.
create policy "allow public insert"
  on public.daily_snapshot
  for insert
  with check (true);

create policy "allow public update"
  on public.daily_snapshot
  for update
  using (true)
  with check (true);
