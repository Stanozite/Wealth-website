-- ============================================================
-- Wealth Compass — articles schema v1
-- Run in Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ============================================================

-- 1. Articles table
create table if not exists public.articles (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,            -- e.g. 'my-new-article' (no .html)
  pillar      text not null default 'foundation'
              check (pillar in ('foundation','debt','invest','tax','protect','retire')),
  emoji       text not null default '📄',
  title_th    text not null,
  title_en    text not null default '',
  desc_th     text not null default '',
  desc_en     text not null default '',
  content_th  text not null default '',        -- article body HTML (Thai)
  content_en  text not null default '',        -- article body HTML (English)
  thumb_url   text,                            -- storage public URL or external URL
  tool_slug   text,                            -- e.g. 'budget-planner.html' (mid-article CTA target)
  read_min    integer not null default 7,
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_articles_updated on public.articles;
create trigger trg_articles_updated
  before update on public.articles
  for each row execute function public.set_updated_at();

-- 2. Row Level Security
alter table public.articles enable row level security;

-- anyone (anon) can read PUBLISHED articles
drop policy if exists "public read published" on public.articles;
create policy "public read published"
  on public.articles for select
  using (published = true);

-- logged-in users (the admin) can do everything
drop policy if exists "authenticated full access" on public.articles;
create policy "authenticated full access"
  on public.articles for all
  to authenticated
  using (true)
  with check (true);

-- 3. Storage bucket for thumbnails (public read)
insert into storage.buckets (id, name, public)
values ('thumbs', 'thumbs', true)
on conflict (id) do nothing;

drop policy if exists "public read thumbs" on storage.objects;
create policy "public read thumbs"
  on storage.objects for select
  using (bucket_id = 'thumbs');

drop policy if exists "authenticated upload thumbs" on storage.objects;
create policy "authenticated upload thumbs"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'thumbs');

drop policy if exists "authenticated update thumbs" on storage.objects;
create policy "authenticated update thumbs"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'thumbs');

drop policy if exists "authenticated delete thumbs" on storage.objects;
create policy "authenticated delete thumbs"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'thumbs');

-- ============================================================
-- After running this file:
-- 1. Authentication > Users > Add user (email + password) = admin login
-- 2. Settings > API: copy Project URL + anon public key → _brand.js
-- ============================================================
