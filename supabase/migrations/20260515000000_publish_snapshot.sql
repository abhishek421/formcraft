-- Draft/live snapshot: published_fields table, published_snapshot + has_unpublished_changes on forms

-- 1. Add draft-tracking columns to forms
alter table forms
  add column has_unpublished_changes boolean not null default false,
  add column published_snapshot jsonb;

-- 2. published_fields: snapshot of fields rows at last publish time
create table published_fields (
  id uuid not null,
  form_id uuid not null references forms(id) on delete cascade,
  type text not null,
  title text not null default '',
  description text,
  required boolean not null default false,
  position integer not null default 0,
  variable text,
  config jsonb not null default '{}',
  logic jsonb not null default '[]',
  question_group_id uuid references question_groups(id) on delete set null,
  primary key (form_id, id)
);

create index idx_published_fields_form on published_fields(form_id);
create index idx_published_fields_position on published_fields(form_id, position);

-- 3. RLS
alter table published_fields enable row level security;

-- Owners can manage their own snapshots
create policy "owners can manage published_fields"
  on published_fields for all
  using (
    exists (
      select 1 from forms
      where forms.id = published_fields.form_id
      and forms.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from forms
      where forms.id = published_fields.form_id
      and forms.user_id = auth.uid()
    )
  );

-- Public can read published_fields only for published forms
create policy "public can read published_fields"
  on published_fields for select
  using (
    exists (
      select 1 from forms
      where forms.id = published_fields.form_id
      and forms.published = true
    )
  );

-- 4. Grants — anon/authenticated need SELECT for the renderer
grant select on published_fields to anon, authenticated;
