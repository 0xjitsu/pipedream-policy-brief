-- Per-source fetch diagnostics. Used by src/lib/daily-pipeline/fetchLog.ts
-- to record which source+strategy succeeded/failed per cron run.
--
-- Apply via Supabase MCP `apply_migration` or dashboard SQL editor.

create table if not exists public.fetch_log (
  id             bigserial primary key,
  logged_at      timestamptz not null default now(),
  source         text not null,        -- 'doe' | 'gpp' | 'osm'
  strategy       text not null,        -- 'primary' | 'firecrawl' | 'mirror'
  success        boolean not null,
  duration_ms    integer,
  error_message  text
);

create index if not exists idx_fetch_log_source_time
  on public.fetch_log (source, logged_at desc);

alter table public.fetch_log enable row level security;

create policy "public read fetch_log"
  on public.fetch_log
  for select
  using (true);

create policy "public insert fetch_log"
  on public.fetch_log
  for insert
  with check (true);
