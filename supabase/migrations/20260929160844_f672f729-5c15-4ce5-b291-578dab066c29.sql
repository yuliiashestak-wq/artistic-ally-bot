create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  avatar_id text not null default 'rabbit',
  avatar_image text,
  tokens integer not null default 120,
  created_at timestamptz not null default now()
);

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  emoji text not null default '✨',
  hue integer not null default 292,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.projects to authenticated;
grant all on public.projects to service_role;

alter table public.projects enable row level security;

create policy "Users can read their own projects"
  on public.projects for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can create their own projects"
  on public.projects for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on public.projects for delete to authenticated
  using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'username', ''), split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();