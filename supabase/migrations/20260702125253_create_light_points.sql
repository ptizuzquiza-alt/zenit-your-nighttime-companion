-- Real Barcelona street lamp data, used by fetchZenitRoute() to score
-- routes by illumination. Referenced by src/lib/streetlamps.ts.
create table if not exists public.light_points (
  id           uuid primary key default gen_random_uuid(),
  latitude     double precision not null,
  longitude    double precision not null,
  street_name  text,
  light_type   text,
  power_watts  integer,
  district     text,
  neighborhood text,
  created_at   timestamptz not null default now()
);

create index if not exists light_points_lat_lon_idx
  on public.light_points (latitude, longitude);

alter table public.light_points enable row level security;

create policy "Light points are viewable by everyone"
  on public.light_points for select
  to anon, authenticated
  using (true);
