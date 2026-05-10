-- Grant table-level access to anon/authenticated roles
-- RLS policies control row-level access on top of these grants

grant select on forms to anon, authenticated;
grant select on fields to anon, authenticated;
grant insert on responses to anon, authenticated;
grant insert on answers to anon, authenticated;
