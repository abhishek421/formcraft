-- Forms table
create table forms (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Untitled Form',
  description text,
  settings jsonb not null default '{
    "show_progress_bar": true,
    "show_question_number": true,
    "one_question_at_a_time": true
  }',
  theme jsonb not null default '{
    "primary_color": "#000000",
    "background_color": "#ffffff",
    "font": "Inter"
  }',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Fields table
create table fields (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references forms(id) on delete cascade,
  type text not null,
  title text not null default '',
  description text,
  required boolean not null default false,
  position integer not null default 0,
  variable text,
  config jsonb not null default '{}',
  logic jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- Responses table
create table responses (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references forms(id) on delete cascade,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  metadata jsonb not null default '{}'
);

-- Answers table
create table answers (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references responses(id) on delete cascade,
  field_id uuid not null references fields(id) on delete cascade,
  value jsonb,
  created_at timestamptz not null default now()
);

-- Indexes
create index fields_form_id_idx on fields(form_id);
create index fields_position_idx on fields(form_id, position);
create index responses_form_id_idx on responses(form_id);
create index answers_response_id_idx on answers(response_id);
create index answers_field_id_idx on answers(field_id);

-- Auto-update updated_at on forms
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger forms_updated_at
  before update on forms
  for each row execute function update_updated_at();
