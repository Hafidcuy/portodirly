-- ===========================================================================
--  portodirly — skema database Supabase
--  Jalankan seluruh isi file ini di  Supabase Dashboard > SQL Editor > Run
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 0. Utilitas
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Mengisi sort_order otomatis bila tidak dikirim dari aplikasi.
create or replace function public.assign_sort_order()
returns trigger
language plpgsql
as $$
begin
  if new.sort_order is null then
    execute format(
      'select coalesce(max(sort_order), 0) + 1 from public.%I',
      tg_table_name
    ) into new.sort_order;
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. profiles — identitas pemilik (selalu tepat satu baris, id = 1)
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id                       integer primary key default 1 check (id = 1),
  full_name                text not null default '',
  status_label_en          text not null default '',
  status_label_id          text not null default '',
  kicker_en                text not null default '',
  kicker_id                text not null default '',
  headline_en              text not null default '',
  headline_id              text not null default '',
  tagline_en               text not null default '',
  tagline_id               text not null default '',
  cta_primary_label_en     text not null default '',
  cta_primary_label_id     text not null default '',
  cta_primary_href         text not null default '#projects',
  cta_secondary_label_en   text not null default '',
  cta_secondary_label_id   text not null default '',
  cta_secondary_href       text not null default '#contact',
  avatar_url               text,
  about_title_en           text not null default '',
  about_title_id           text not null default '',
  about_body_en            text not null default '',
  about_body_id            text not null default '',
  about_photo_url          text,
  email                    text not null default '',
  phone                    text not null default '',
  location_en              text not null default '',
  location_id              text not null default '',
  site_title_en            text not null default '',
  site_title_id            text not null default '',
  site_description_en      text not null default '',
  site_description_id      text not null default '',
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. settings — preferensi global (selalu tepat satu baris, id = 1)
-- ---------------------------------------------------------------------------

create table if not exists public.settings (
  id             integer primary key default 1 check (id = 1),
  default_theme  text not null default 'system'
                 check (default_theme in ('system', 'light', 'dark')),
  updated_at     timestamptz not null default now()
);

drop trigger if exists settings_updated_at on public.settings;
create trigger settings_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. social_links
-- ---------------------------------------------------------------------------

create table if not exists public.social_links (
  id          uuid primary key default gen_random_uuid(),
  label       text not null,
  url         text not null,
  icon        text not null default 'link',
  sort_order  integer,
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists social_links_sort on public.social_links;
create trigger social_links_sort
  before insert on public.social_links
  for each row execute function public.assign_sort_order();

drop trigger if exists social_links_updated_at on public.social_links;
create trigger social_links_updated_at
  before update on public.social_links
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. skills
-- ---------------------------------------------------------------------------

create table if not exists public.skills (
  id           uuid primary key default gen_random_uuid(),
  name_en      text not null,
  name_id      text not null default '',
  category_en  text not null default 'General',
  category_id  text not null default 'Umum',
  icon         text not null default 'code',
  level        integer not null default 80
               check (level between 0 and 100),
  sort_order   integer,
  is_visible   boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

drop trigger if exists skills_sort on public.skills;
create trigger skills_sort
  before insert on public.skills
  for each row execute function public.assign_sort_order();

drop trigger if exists skills_updated_at on public.skills;
create trigger skills_updated_at
  before update on public.skills
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 5. projects
-- ---------------------------------------------------------------------------

create table if not exists public.projects (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  title_en       text not null,
  title_id       text not null default '',
  summary_en     text not null default '',
  summary_id     text not null default '',
  description_en text not null default '',
  description_id text not null default '',
  category_en    text not null default 'Web',
  category_id    text not null default 'Web',
  cover_url      text,
  tech_tags      text[] not null default '{}',
  live_url       text,
  repo_url       text,
  is_featured    boolean not null default false,
  is_visible     boolean not null default true,
  sort_order     integer,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

drop trigger if exists projects_sort on public.projects;
create trigger projects_sort
  before insert on public.projects
  for each row execute function public.assign_sort_order();

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create index if not exists projects_slug_idx on public.projects (slug);
create index if not exists projects_visible_idx on public.projects (is_visible);

-- ---------------------------------------------------------------------------
-- 6. experiences
-- ---------------------------------------------------------------------------

create table if not exists public.experiences (
  id            uuid primary key default gen_random_uuid(),
  role_en       text not null,
  role_id       text not null default '',
  company       text not null default '',
  company_url   text,
  location_en   text not null default '',
  location_id   text not null default '',
  start_date    date not null,
  end_date      date,
  description_en text not null default '',
  description_id text not null default '',
  sort_order    integer,
  is_visible    boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint experiences_date_order
    check (end_date is null or end_date >= start_date)
);

drop trigger if exists experiences_sort on public.experiences;
create trigger experiences_sort
  before insert on public.experiences
  for each row execute function public.assign_sort_order();

drop trigger if exists experiences_updated_at on public.experiences;
create trigger experiences_updated_at
  before update on public.experiences
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 7. educations
-- ---------------------------------------------------------------------------

create table if not exists public.educations (
  id             uuid primary key default gen_random_uuid(),
  institution    text not null,
  degree_en      text not null default '',
  degree_id      text not null default '',
  field_en       text not null default '',
  field_id       text not null default '',
  location_en    text not null default '',
  location_id    text not null default '',
  start_date     date not null,
  end_date       date,
  description_en text not null default '',
  description_id text not null default '',
  sort_order     integer,
  is_visible     boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint educations_date_order
    check (end_date is null or end_date >= start_date)
);

drop trigger if exists educations_sort on public.educations;
create trigger educations_sort
  before insert on public.educations
  for each row execute function public.assign_sort_order();

drop trigger if exists educations_updated_at on public.educations;
create trigger educations_updated_at
  before update on public.educations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 8. certificates
-- ---------------------------------------------------------------------------

create table if not exists public.certificates (
  id             uuid primary key default gen_random_uuid(),
  name_en        text not null,
  name_id        text not null default '',
  issuer_en      text not null default '',
  issuer_id      text not null default '',
  issued_date    date not null default current_date,
  expires_date   date,
  credential_url text,
  image_url      text,
  sort_order     integer,
  is_visible     boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint certificates_date_order
    check (expires_date is null or expires_date >= issued_date)
);

drop trigger if exists certificates_sort on public.certificates;
create trigger certificates_sort
  before insert on public.certificates
  for each row execute function public.assign_sort_order();

drop trigger if exists certificates_updated_at on public.certificates;
create trigger certificates_updated_at
  before update on public.certificates
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 9. messages — pesan dari form kontak (bukan konten bilingual)
-- ---------------------------------------------------------------------------

create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  subject     text not null,
  body        text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists messages_created_at_idx
  on public.messages (created_at desc);

-- ---------------------------------------------------------------------------
-- 10. Row Level Security — SEMUA tabel ditutup rapat.
--     Aplikasi memakai service role key dari server, jadi tidak perlu policy.
-- ---------------------------------------------------------------------------

do $$
declare t text;
begin
  for t in
    select unnest(array[
      'profiles', 'settings', 'social_links', 'skills', 'projects',
      'experiences', 'educations', 'certificates', 'messages'
    ])
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "%s deny all" on public.%I;', t, t);
    execute format(
      'create policy "%s deny all" on public.%I for all to anon, authenticated using (false) with check (false);',
      t, t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- 11. Storage — bucket publik untuk semua gambar
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('portfolio-assets', 'portfolio-assets', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 12. Baris awal
-- ---------------------------------------------------------------------------

insert into public.profiles (id, full_name)
values (1, 'Your Name')
on conflict (id) do nothing;

insert into public.settings (id, default_theme)
values (1, 'system')
on conflict (id) do nothing;
