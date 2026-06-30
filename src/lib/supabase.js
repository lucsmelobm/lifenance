import { createClient } from "@supabase/supabase-js";

let _sb = null;

export function getSb() {
  if (_sb) return _sb;
  const url = localStorage.getItem("lf_sb_url");
  const key = localStorage.getItem("lf_sb_key");
  if (url && key) _sb = createClient(url, key);
  return _sb;
}

export function configure(url, key) {
  const trimUrl = url.trim();
  const trimKey = key.trim();
  localStorage.setItem("lf_sb_url", trimUrl);
  localStorage.setItem("lf_sb_key", trimKey);
  _sb = createClient(trimUrl, trimKey);
  return _sb;
}

export function clearConfig() {
  localStorage.removeItem("lf_sb_url");
  localStorage.removeItem("lf_sb_key");
  _sb = null;
}

export function isConfigured() {
  return !!(localStorage.getItem("lf_sb_url") && localStorage.getItem("lf_sb_key"));
}

// SQL to paste in Supabase SQL Editor
export const SETUP_SQL = `
-- Cole este SQL no SQL Editor do seu projeto Supabase

create table public.profiles (
  id uuid references auth.users(id) primary key,
  name text not null default 'Você',
  income numeric not null default 3000,
  saving_goal_pct integer not null default 20,
  couple_code text,
  color text default '#B8F23C'
);

create table public.expenses (
  id bigserial primary key,
  user_id uuid references auth.users(id) not null,
  description text not null,
  amount numeric not null,
  category text not null,
  date date not null,
  created_at timestamptz default now()
);

create table public.goals (
  id bigserial primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  target numeric not null,
  saved numeric not null default 0,
  icon text default '✈️',
  deadline date
);

create table public.fixed_bills (
  id bigserial primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  amount numeric not null,
  due_day integer not null,
  category text default 'outros'
);

create table public.extra_income (
  id bigserial primary key,
  user_id uuid references auth.users(id) not null,
  description text not null,
  amount numeric not null,
  date date not null
);

create table public.checkins (
  id bigserial primary key,
  user_id uuid references auth.users(id) not null,
  date date not null,
  habits text[] default '{}',
  unique(user_id, date)
);

alter table public.profiles enable row level security;
alter table public.expenses enable row level security;
alter table public.goals enable row level security;
alter table public.fixed_bills enable row level security;
alter table public.extra_income enable row level security;
alter table public.checkins enable row level security;

create policy "own" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own" on public.goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own" on public.fixed_bills for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own" on public.extra_income for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own" on public.checkins for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own_expenses" on public.expenses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "partner_expenses" on public.expenses for select using (
  exists (
    select 1 from public.profiles p1
    join public.profiles p2 on p1.couple_code = p2.couple_code
    where p1.id = auth.uid() and p2.id = user_id
    and p1.couple_code is not null
  )
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
`.trim();
