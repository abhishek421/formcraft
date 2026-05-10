-- v1.5 Experiment tables: question groups, variants, sessions, events, optimization

-- question_groups
create table question_groups (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references forms(id) on delete cascade,
  label text not null,
  optimization_goal text not null default 'completion_rate',
  strategy text not null default 'epsilon_greedy',
  created_at timestamptz not null default now()
);

-- question_variants
create table question_variants (
  id uuid primary key default gen_random_uuid(),
  question_group_id uuid not null references question_groups(id) on delete cascade,
  variant_label text not null,
  title text not null,
  description text,
  type text not null,
  config jsonb not null default '{}',
  logic jsonb not null default '[]',
  traffic_weight numeric not null default 1.0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- form_sessions
create table form_sessions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references forms(id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  device_type text,
  referrer text,
  metadata jsonb not null default '{}'
);

-- variant_assignments
create table variant_assignments (
  session_id uuid not null references form_sessions(id) on delete cascade,
  question_group_id uuid not null references question_groups(id) on delete cascade,
  variant_id uuid not null references question_variants(id),
  assigned_at timestamptz not null default now(),
  primary key (session_id, question_group_id)
);

-- question_events
create table question_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references form_sessions(id) on delete cascade,
  variant_id uuid references question_variants(id) on delete cascade,
  field_id uuid references fields(id) on delete cascade,
  event_type text not null,
  duration_ms integer,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- optimization_runs
create table optimization_runs (
  id uuid primary key default gen_random_uuid(),
  question_group_id uuid not null references question_groups(id) on delete cascade,
  ran_at timestamptz not null default now(),
  variant_scores jsonb not null,
  action text,
  notes text
);

-- Indexes
create index idx_question_variants_group on question_variants(question_group_id);
create index idx_variant_assignments_session on variant_assignments(session_id);
create index idx_variant_assignments_group on variant_assignments(question_group_id);
create index idx_question_events_session on question_events(session_id);
create index idx_question_events_variant on question_events(variant_id);
create index idx_question_events_type_variant on question_events(event_type, variant_id);
create index idx_form_sessions_form on form_sessions(form_id);
create index idx_optimization_runs_group_ran on optimization_runs(question_group_id, ran_at);

-- Alter existing tables
alter table fields add column question_group_id uuid references question_groups(id) on delete set null;
alter table responses add column session_id uuid references form_sessions(id) on delete set null;

-- Enable RLS
alter table question_groups enable row level security;
alter table question_variants enable row level security;
alter table form_sessions enable row level security;
alter table variant_assignments enable row level security;
alter table question_events enable row level security;
alter table optimization_runs enable row level security;

-- RLS: question_groups — owner read/write via form ownership
create policy "owners can manage question_groups"
  on question_groups for all
  using (
    exists (
      select 1 from forms
      where forms.id = question_groups.form_id
      and forms.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from forms
      where forms.id = question_groups.form_id
      and forms.user_id = auth.uid()
    )
  );

-- RLS: question_variants — owner read/write via group → form ownership
create policy "owners can manage question_variants"
  on question_variants for all
  using (
    exists (
      select 1 from question_groups
      join forms on forms.id = question_groups.form_id
      where question_groups.id = question_variants.question_group_id
      and forms.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from question_groups
      join forms on forms.id = question_groups.form_id
      where question_groups.id = question_variants.question_group_id
      and forms.user_id = auth.uid()
    )
  );

-- RLS: form_sessions — public insert, owner select via form ownership
create policy "anyone can insert form_sessions"
  on form_sessions for insert
  with check (true);

create policy "owners can read form_sessions"
  on form_sessions for select
  using (
    exists (
      select 1 from forms
      where forms.id = form_sessions.form_id
      and forms.user_id = auth.uid()
    )
  );

-- RLS: variant_assignments — public insert, owner select via session → form ownership
create policy "anyone can insert variant_assignments"
  on variant_assignments for insert
  with check (true);

create policy "owners can read variant_assignments"
  on variant_assignments for select
  using (
    exists (
      select 1 from form_sessions
      join forms on forms.id = form_sessions.form_id
      where form_sessions.id = variant_assignments.session_id
      and forms.user_id = auth.uid()
    )
  );

-- RLS: question_events — public insert, owner select via session → form ownership
create policy "anyone can insert question_events"
  on question_events for insert
  with check (true);

create policy "owners can read question_events"
  on question_events for select
  using (
    exists (
      select 1 from form_sessions
      join forms on forms.id = form_sessions.form_id
      where form_sessions.id = question_events.session_id
      and forms.user_id = auth.uid()
    )
  );

-- RLS: optimization_runs — owner select only (service role writes bypass RLS)
create policy "owners can read optimization_runs"
  on optimization_runs for select
  using (
    exists (
      select 1 from question_groups
      join forms on forms.id = question_groups.form_id
      where question_groups.id = optimization_runs.question_group_id
      and forms.user_id = auth.uid()
    )
  );

-- Grants for anon/public insert on session tracking tables
grant insert on form_sessions to anon, authenticated;
grant insert on variant_assignments to anon, authenticated;
grant insert on question_events to anon, authenticated;
