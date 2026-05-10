-- Enable pg_cron and pg_net extensions
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Schedule optimize-variants edge function every 15 minutes
select cron.schedule(
  'optimize-variants',
  '*/15 * * * *',
  $$
  select net.http_post(
    url    := 'https://wjbhllqjpwovcxvdorup.supabase.co/functions/v1/optimize-variants',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer fc-cron-8517a7f8ecad01f7efcaa0be98b0272a'
    ),
    body   := '{}'::jsonb
  );
  $$
);
