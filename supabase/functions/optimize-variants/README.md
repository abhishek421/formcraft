# optimize-variants Edge Function

Runs the FormCraft v1.5 A/B optimization engine. Scores each active variant per question group, rebalances traffic weights using a weighted softmax with an exploration floor, and records every run in `optimization_runs`.

## Deploy

```bash
supabase functions deploy optimize-variants
```

## Required Environment Variables

Set these in Supabase Dashboard → Project Settings → Edge Functions → Secrets, or via CLI:

```bash
supabase secrets set SUPABASE_URL=<your-project-url>
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
supabase secrets set CRON_SECRET=<random-secret-string>
```

| Variable                  | Description                                               |
|---------------------------|-----------------------------------------------------------|
| `SUPABASE_URL`            | Project URL (`https://<ref>.supabase.co`)                 |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — bypasses RLS for cross-tenant writes |
| `CRON_SECRET`             | Shared secret for the Authorization header                |

## Schedule (every 15 minutes)

Configure in Supabase Dashboard → Edge Functions → `optimize-variants` → Schedule.

- Cron expression: `*/15 * * * *`
- The scheduler sends an HTTP POST with header `Authorization: Bearer <CRON_SECRET>`

## Authorization

Every request must include:

```
Authorization: Bearer <CRON_SECRET>
```

Requests without this header or with the wrong token receive `401 Unauthorized`.

## Response

```json
{
  "processed": 12,
  "rebalanced": 8,
  "skipped_low_data": 3,
  "skipped_no_change": 1,
  "errors": []
}
```

## Scoring Algorithm

For each active variant in a group:

```
answer_rate       = answered_events / shown_events
avg_time_penalty  = clamp(avg_duration_ms / 30000, 0, 1)   // 0 if no answered events
score             = answer_rate * (1 - 0.3 * avg_time_penalty)
```

Guard rails:

- Groups with any variant below 100 impressions are skipped (`skipped_low_data`).
- Groups where all scores are within 0.03 of each other are skipped (`skipped_no_change`).

Weight normalization with exploration floor:

```
n     = number of active variants
floor = min(0.05, 0.5 / n)          // per-variant floor, total floor capped at 0.5
weight[i] = floor + (score[i] / sum_scores) * (1 - n * floor)
```
