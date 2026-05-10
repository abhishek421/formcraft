create table api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  key_hash text not null unique,
  key_prefix text not null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

alter table api_keys enable row level security;

create policy "owners can manage their api keys"
  on api_keys for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
