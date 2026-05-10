# FormCraft

A modern form builder that makes data collection feel effortless. One question at a time, only the ones that matter.

## What it is

FormCraft is a full-stack form builder with a conversational, one-question-at-a-time experience — think Typeform, but with a developer-first REST API, per-form theming, and logic branching that actually makes sense to configure.

## Features

- **Conversational renderer** — one question at a time, keyboard navigation, animated transitions
- **Logic branching** — jump to any field or end the form based on answers
- **Variable interpolation** — reference previous answers in later questions using `{{variable}}`
- **Per-form theming** — primary color, background, font, custom brand logo
- **File upload** — drag-and-drop, 5MB limit, stored in Supabase Storage
- **REST API** — full CRUD for forms, fields, and responses via `/api/v1`
- **API key management** — generate, list, and revoke keys from the dashboard
- **Responses dashboard** — table view with sortable columns and slide-in detail panel

## Stack

| Layer | Tech |
|---|---|
| Builder | Next.js 15 (App Router) |
| Renderer | SolidJS + Vite |
| Database | Supabase (Postgres + Auth + Storage) |
| Monorepo | Turborepo |
| Schema | Zod (shared package) |

## Project Structure

```
formcraft/
├── apps/
│   ├── builder/        # Next.js app — dashboard, builder, API
│   └── renderer/       # SolidJS app — public form renderer
└── packages/
    └── schema/         # Shared Zod types (Field, Form, WidgetType)
```

## Getting Started

**Prerequisites:** Node.js 20+, Supabase CLI

```bash
# Install dependencies
npm install

# Start local Supabase
supabase start

# Apply migrations
supabase migration up

# Start dev servers (builder on :3000, renderer on :3001)
npm run dev
```

Set up your `.env.local` in `apps/builder/` and `apps/renderer/`:

```env
# apps/builder/.env.local
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
NEXT_PUBLIC_RENDERER_URL=http://localhost:3001

# apps/renderer/.env.local
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

## REST API

All endpoints require `Authorization: Bearer <api_key>`. Generate a key from the API Keys section in the dashboard.

```
GET    /api/v1/forms
POST   /api/v1/forms
GET    /api/v1/forms/:id
PATCH  /api/v1/forms/:id
DELETE /api/v1/forms/:id

GET    /api/v1/forms/:id/fields
POST   /api/v1/forms/:id/fields
PATCH  /api/v1/forms/:id/fields/:fieldId
DELETE /api/v1/forms/:id/fields/:fieldId
PUT    /api/v1/forms/:id/fields/reorder

GET    /api/v1/forms/:id/responses
GET    /api/v1/forms/:id/responses/:responseId
```

**Example — create a form:**

```bash
curl -X POST https://your-domain.com/api/v1/forms \
  -H "Authorization: Bearer fc_..." \
  -H "Content-Type: application/json" \
  -d '{"title": "Contact Form"}'
```

## Field Types

`short_text` · `long_text` · `email` · `number` · `phone` · `url` · `date` · `dropdown` · `multiple_choice` · `yes_no` · `rating` · `opinion_scale` · `file_upload` · `statement` · `welcome_screen`

## License

MIT
