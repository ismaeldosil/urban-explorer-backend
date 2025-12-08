# Urban Explorer Backend

[![CI](https://github.com/ismaeldosil/urban-explorer-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/ismaeldosil/urban-explorer-backend/actions/workflows/ci.yml)
[![Deploy](https://github.com/ismaeldosil/urban-explorer-backend/actions/workflows/railway-deploy.yml/badge.svg)](https://github.com/ismaeldosil/urban-explorer-backend/actions/workflows/railway-deploy.yml)
[![Coverage](https://img.shields.io/badge/coverage-0%25-red)](https://github.com/ismaeldosil/urban-explorer-backend)
[![Railway](https://img.shields.io/badge/Railway-0B0D0E?logo=railway&logoColor=white)](https://railway.app/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)

> API Gateway for Urban Explorer - Node.js/Express + Supabase

<!--
=============================================================================
AGENT DOCUMENTATION REFERENCES (invisible in GitHub, readable by AI agents)
=============================================================================

## Project Context
- Main project docs: ../urban-explorer-docs/
- Project context and status: ../urban-explorer-docs/PROJECT-CONTEXT.md
- Project roadmap: ../urban-explorer-docs/PROJECT-ROADMAP.md

## Backend Specific Documentation
- Full backend README: ../urban-explorer-docs/backend/FULL-README.md
- Edge Functions guide: ../urban-explorer-docs/backend/functions/FUNCTIONS-README.md
- API Reference: ../urban-explorer-docs/backend/api/API-Reference.md
- CHANGELOG: ../urban-explorer-docs/backend/CHANGELOG.md

## Testing Documentation
- Test infrastructure plan: ../urban-explorer-docs/testing/TEST-INFRASTRUCTURE-PLAN.md
- TDD Guide: ../urban-explorer-docs/shared/guides/tdd-guide.md
- Testing strategy: ../urban-explorer-docs/shared/testing-strategy.md

## Architecture & Principles
- CLAUDE.md (agent config): ./CLAUDE.md
- SOLID/Clean Code: ../urban-explorer-docs/.claude/agents/frontend/SOLID-CLEAN-CODE.md
- Database schema: ../urban-explorer-docs/shared/database-diagram.md

## GitHub Issues for Testing (Backend)
- #27: Setup test infrastructure with Vitest (CRITICAL)
- #28: Unit tests for Config and Environment (CRITICAL)
- #29: Unit tests for Middleware/Error Handler (CRITICAL)
- #30: Unit tests for Supabase Service (HIGH)
- #31: Integration tests for Health Route (HIGH)
- #32: Integration tests for Locations Routes (CRITICAL)
- #33: Integration tests for Root Route and Index (HIGH)
- #34: E2E tests for complete API flows (MEDIUM)

## Coverage Targets
- Statements: 85%
- Branches: 80%
- Functions: 85%
- Lines: 85%

## Tech Stack Details
- Runtime: Node.js 20.x
- Framework: Express 4.x
- Language: TypeScript 5.x
- Database: Supabase (PostgreSQL + PostGIS)
- Validation: Zod
- Testing: Vitest + Supertest
- Deploy: Railway (Nixpacks)

## Key Files
- Entry point: src/index.ts
- Routes: src/routes/ (health.ts, locations.ts, index.ts)
- Services: src/services/supabase.ts
- Middleware: src/middleware/errorHandler.ts
- Config: src/config/env.ts
- Test config: vitest.config.ts (to be created)
- Tests: tests/ (to be created)

=============================================================================
-->

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

# Tests
npm test
npm run test:coverage
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
- **Vitest** - Testing framework

## License

MIT License - See [LICENSE](LICENSE) for details.
