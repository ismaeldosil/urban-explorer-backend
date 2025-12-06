# Urban Explorer Backend

[![CI](https://github.com/ismaeldosil/urban-explorer-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/ismaeldosil/urban-explorer-backend/actions/workflows/ci.yml)
[![Deploy](https://github.com/ismaeldosil/urban-explorer-backend/actions/workflows/deploy.yml/badge.svg)](https://github.com/ismaeldosil/urban-explorer-backend/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Deno](https://img.shields.io/badge/Deno-000000?logo=deno&logoColor=white)](https://deno.land/)

> Serverless backend for Urban Explorer with Supabase

## About The Project

This repository contains the entire backend infrastructure for **Urban Explorer**, a gamified urban exploration app. It includes:

- **PostgreSQL database** with PostGIS for geospatial queries
- **Authentication** with email, Google, and Apple
- **Edge Functions** for serverless business logic
- **Storage** for user and location images
- **Row Level Security (RLS)** for row-level data protection

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SUPABASE CLOUD                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │    Auth     │  │   Storage   │  │    Edge Functions       │ │
│  │  (JWT/OAuth)│  │  (Images)   │  │  (Deno/TypeScript)      │ │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘ │
│         │                │                     │               │
│         └────────────────┼─────────────────────┘               │
│                          │                                     │
│                    ┌─────┴─────┐                               │
│                    │ PostgreSQL │                               │
│                    │ + PostGIS  │                               │
│                    └───────────┘                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [Supabase](https://supabase.com/) | Backend as a Service |
| [PostgreSQL](https://www.postgresql.org/) | Relational database |
| [PostGIS](https://postgis.net/) | Geospatial extension |
| [Deno](https://deno.land/) | Edge Functions runtime |
| [TypeScript](https://www.typescriptlang.org/) | Typed language |

## Project Structure

```
urban-explorer-backend/
├── supabase/
│   ├── migrations/           # SQL migrations
│   │   ├── 00001_initial_schema.sql
│   │   ├── 00002_rls_policies.sql
│   │   └── 00003_postgis_functions.sql
│   ├── functions/            # Edge Functions
│   │   ├── get-nearby-locations/
│   │   ├── update-location-stats/
│   │   └── get-user-feed/
│   └── seed.sql              # Initial data
├── .github/
│   └── workflows/            # CI/CD
└── README.md
```

## Database Schema

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   profiles   │     │  locations   │     │   reviews    │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ id (uuid)    │     │ id (uuid)    │     │ id (uuid)    │
│ username     │────▶│ category_id  │◀────│ location_id  │
│ email        │     │ name         │     │ user_id      │
│ avatar_url   │     │ coordinates  │     │ rating       │
│ bio          │     │ rating       │     │ comment      │
│ location     │     │ review_count │     │ photos[]     │
└──────────────┘     └──────────────┘     └──────────────┘
        │                   │                    │
        │            ┌──────┴──────┐             │
        │            ▼             ▼             │
        │     ┌────────────┐ ┌──────────┐        │
        │     │ categories │ │ favorites │◀──────┘
        │     └────────────┘ └──────────┘
        │
        ▼
┌──────────────┐     ┌──────────────┐
│   badges     │     │ user_badges  │
├──────────────┤     ├──────────────┤
│ id (uuid)    │◀────│ user_id      │
│ name         │     │ badge_id     │
│ description  │     │ unlocked_at  │
│ icon         │     └──────────────┘
└──────────────┘
```

## Edge Functions

| Function | Description | Endpoint |
|----------|-------------|----------|
| `get-nearby-locations` | Find nearby places using PostGIS | `POST /functions/v1/get-nearby-locations` |
| `update-location-stats` | Update rating and review count | `POST /functions/v1/update-location-stats` |
| `get-user-feed` | Personalized activity feed | `POST /functions/v1/get-user-feed` |

## Installation

### Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) installed
- [Docker](https://www.docker.com/) (for local development)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/ismaeldosil/urban-explorer-backend.git
   cd urban-explorer-backend
   ```

2. **Start local Supabase**
   ```bash
   supabase start
   ```

3. **Apply migrations**
   ```bash
   supabase db reset
   ```

4. **Run Edge Functions**
   ```bash
   supabase functions serve
   ```

### Environment Variables

After `supabase start`, copy these values to the frontend:

```bash
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

## Deployment

### Migrations

```bash
supabase db push
```

### Edge Functions

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy get-nearby-locations
```

## Security

### Row Level Security (RLS)

All tables have RLS enabled with policies for:

- **SELECT**: Public data or user's own data
- **INSERT**: Own data only
- **UPDATE**: Own data only
- **DELETE**: Own data only

### Authentication

- JWT tokens with 1-hour expiration
- Refresh tokens with 7-day expiration
- OAuth with Google and Apple

## Related Repositories

| Repository | Description |
|------------|-------------|
| [urban-explorer-frontend](https://github.com/ismaeldosil/urban-explorer-frontend) | Ionic mobile app |
| [urban-explorer-docs](https://github.com/ismaeldosil/urban-explorer-docs) | Documentation |

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<p align="center">
  Powered by <img src="https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white" alt="Supabase" height="20">
</p>
