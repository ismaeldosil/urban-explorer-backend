# Urban Explorer Backend

[![CI](https://github.com/ismaeldosil/urban-explorer-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/ismaeldosil/urban-explorer-backend/actions/workflows/ci.yml)
[![Deploy](https://github.com/ismaeldosil/urban-explorer-backend/actions/workflows/railway-deploy.yml/badge.svg)](https://github.com/ismaeldosil/urban-explorer-backend/actions/workflows/railway-deploy.yml)
[![Railway](https://img.shields.io/badge/Railway-0B0D0E?logo=railway&logoColor=white)](https://railway.app/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)

> API Gateway for Urban Explorer - Node.js/Express + Supabase

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your Supabase credentials

# Development
npm run dev

# Build
npm run build

# Production
npm start
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/api/health` | Health check |
| GET | `/api/locations/nearby` | Get nearby locations |
| GET | `/api/locations/search` | Search locations |
| GET | `/api/locations/:id` | Get location details |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | No |
| `CORS_ORIGIN` | Allowed origins (comma-separated) | No |

## Deployment

### Railway (Recommended)

1. Login to Railway: `railway login`
2. Link project: `railway link`
3. Deploy: `railway up`

Or via GitHub Actions:
1. Add `RAILWAY_TOKEN` secret in GitHub
2. Push to `main` branch

### Manual Deployment

```bash
npm run build
npm start
```

## Tech Stack

- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Supabase** - Backend as a Service
- **Zod** - Schema validation

## Documentation

All documentation is centralized in **[urban-explorer-docs](../urban-explorer-docs/)**:

| Document | Description |
|----------|-------------|
| [Full README](../urban-explorer-docs/backend/FULL-README.md) | Complete project documentation |
| [Functions](../urban-explorer-docs/backend/functions/FUNCTIONS-README.md) | Edge Functions guide |
| [CHANGELOG](../urban-explorer-docs/backend/CHANGELOG.md) | Version history |

## License

MIT License - See [LICENSE](LICENSE) for details.
