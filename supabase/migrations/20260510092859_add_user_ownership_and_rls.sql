-- Add user_id to forms
alter table forms add column user_id uuid references auth.users(id) on delete cascade;

-- Enable RLS on all tables
alter table forms enable row level security;
alter table fields enable row level security;
alter table responses enable row level security;
alter table answers enable row level security;

-- forms: owner can do everything
create policy "owners can manage their forms"
  on forms for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- fields: accessible if you own the parent form
create policy "owners can manage fields"
  on fields for all
  using (
    exists (
      select 1 from forms
      where forms.id = fields.form_id
      and forms.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from forms
      where forms.id = fields.form_id
      and forms.user_id = auth.uid()
    )
  );

-- fields: public can read fields of published forms (for renderer)
create policy "public can read fields of published forms"
  on fields for select
  using (
    exists (
      select 1 from forms
      where forms.id = fields.form_id
      and forms.published = true
    )
  );

-- forms: public can read published forms (for renderer)
create policy "public can read published forms"
  on forms for select
  using (published = true);

-- responses: anyone can insert (submit a form)
create policy "anyone can submit a response"
  on responses for insert
  with check (true);

-- responses: owner can read their form responses
create policy "owners can read responses"
  on responses for select
  using (
    exists (
      select 1 from forms
      where forms.id = responses.form_id
      and forms.user_id = auth.uid()
    )
  );

-- answers: anyone can insert
create policy "anyone can insert answers"
  on answers for insert
  with check (true);

-- answers: owner can read answers of their forms
create policy "owners can read answers"
  on answers for select
  using (
    exists (
      select 1 from responses
      join forms on forms.id = responses.form_id
      where responses.id = answers.response_id
      and forms.user_id = auth.uid()
    )
  );
