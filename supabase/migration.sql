-- Zenit auth migration
-- Run this in the Supabase SQL editor (Dashboard > SQL editor)
-- These tables are referenced by AuthContext, Friends, and Profile pages.

-- ─── profiles ───────────────────────────────────────────────────
-- One row per auth user. Created automatically on sign-up.
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  username    text not null unique,
  avatar_url  text,
  created_at  timestamptz default now()
);

-- Allow users to read any profile (for friend search) and write only their own
alter table public.profiles enable row level security;

create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- ─── friendships ────────────────────────────────────────────────
-- Accepted friendships (bidirectional: store both orientations or use OR in queries)
create table if not exists public.friendships (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  friend_id   uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz default now(),
  unique (user_id, friend_id)
);

alter table public.friendships enable row level security;

create policy "Users can view their own friendships"
  on public.friendships for select
  to authenticated
  using (auth.uid() = user_id or auth.uid() = friend_id);

create policy "Users can create friendships"
  on public.friendships for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete their own friendships"
  on public.friendships for delete
  to authenticated
  using (auth.uid() = user_id or auth.uid() = friend_id);

-- ─── friend_requests ────────────────────────────────────────────
-- Pending friend requests
create table if not exists public.friend_requests (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null references public.profiles(id) on delete cascade,
  receiver_id  uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz default now(),
  unique (sender_id, receiver_id)
);

alter table public.friend_requests enable row level security;

create policy "Users can view requests sent to them"
  on public.friend_requests for select
  to authenticated
  using (auth.uid() = receiver_id or auth.uid() = sender_id);

create policy "Users can send friend requests"
  on public.friend_requests for insert
  to authenticated
  with check (auth.uid() = sender_id);

create policy "Users can delete requests (accept/ignore)"
  on public.friend_requests for delete
  to authenticated
  using (auth.uid() = receiver_id or auth.uid() = sender_id);

-- ─── avatars storage bucket ─────────────────────────────────────
-- Create in Dashboard > Storage > New bucket named "avatars" (public)
-- Then add this policy:
-- insert storage.objects for authenticated users where bucket_id = 'avatars' and name starts with uid()
