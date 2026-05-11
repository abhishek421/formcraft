create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  reason text,
  created_at timestamptz not null default now()
);

alter table waitlist enable row level security;

-- No public access — only service role can read/write
create policy "service role only" on waitlist using (false);
