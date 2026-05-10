-- Fix theme defaults to dark
alter table forms alter column theme set default '{
  "primary_color": "#CAFF00",
  "background_color": "#080808",
  "font": "Inter"
}';

-- Update existing forms that have the old white default
update forms
set theme = jsonb_set(
  jsonb_set(theme, '{background_color}', '"#080808"'),
  '{primary_color}', '"#CAFF00"'
)
where theme->>'background_color' = '#ffffff';
