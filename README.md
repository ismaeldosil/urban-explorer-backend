# Urban Explorer Backend

[![CI](https://github.com/ismaeldosil/urban-explorer-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/ismaeldosil/urban-explorer-backend/actions/workflows/ci.yml)
[![Deploy](https://github.com/ismaeldosil/urban-explorer-backend/actions/workflows/deploy.yml/badge.svg)](https://github.com/ismaeldosil/urban-explorer-backend/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Deno](https://img.shields.io/badge/Deno-000000?logo=deno&logoColor=white)](https://deno.land/)

> Backend serverless para Urban Explorer con Supabase

## Acerca del Proyecto

Este repositorio contiene toda la infraestructura de backend para **Urban Explorer**, una app de exploración urbana gamificada. Incluye:

- **Base de datos PostgreSQL** con PostGIS para consultas geoespaciales
- **Autenticación** con email, Google y Apple
- **Edge Functions** para lógica de negocio serverless
- **Storage** para imágenes de usuarios y lugares
- **Row Level Security (RLS)** para seguridad a nivel de fila

## Arquitectura

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

| Tecnología | Propósito |
|------------|-----------|
| [Supabase](https://supabase.com/) | Backend as a Service |
| [PostgreSQL](https://www.postgresql.org/) | Base de datos relacional |
| [PostGIS](https://postgis.net/) | Extensión geoespacial |
| [Deno](https://deno.land/) | Runtime para Edge Functions |
| [TypeScript](https://www.typescriptlang.org/) | Lenguaje tipado |

## Estructura del Proyecto

```
urban-explorer-backend/
├── supabase/
│   ├── migrations/           # Migraciones SQL
│   │   ├── 00001_initial_schema.sql
│   │   ├── 00002_rls_policies.sql
│   │   └── 00003_postgis_functions.sql
│   ├── functions/            # Edge Functions
│   │   ├── get-nearby-locations/
│   │   ├── update-location-stats/
│   │   └── get-user-feed/
│   └── seed.sql              # Datos iniciales
├── .github/
│   └── workflows/            # CI/CD
└── README.md
```

## Schema de Base de Datos

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

| Función | Descripción | Endpoint |
|---------|-------------|----------|
| `get-nearby-locations` | Busca lugares cercanos usando PostGIS | `POST /functions/v1/get-nearby-locations` |
| `update-location-stats` | Actualiza rating y conteo de reviews | `POST /functions/v1/update-location-stats` |
| `get-user-feed` | Feed personalizado de actividad | `POST /functions/v1/get-user-feed` |

## Instalación

### Prerrequisitos

- [Supabase CLI](https://supabase.com/docs/guides/cli) instalado
- [Docker](https://www.docker.com/) (para desarrollo local)

### Desarrollo Local

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/ismaeldosil/urban-explorer-backend.git
   cd urban-explorer-backend
   ```

2. **Iniciar Supabase local**
   ```bash
   supabase start
   ```

3. **Aplicar migraciones**
   ```bash
   supabase db reset
   ```

4. **Ejecutar Edge Functions**
   ```bash
   supabase functions serve
   ```

### Variables de Entorno

Después de `supabase start`, copia estos valores al frontend:

```bash
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<tu-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<tu-service-role-key>
```

## Deploy

### Migraciones

```bash
supabase db push
```

### Edge Functions

```bash
# Deploy todas las funciones
supabase functions deploy

# Deploy función específica
supabase functions deploy get-nearby-locations
```

## Seguridad

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con políticas para:

- **SELECT**: Datos públicos o propios del usuario
- **INSERT**: Solo datos propios
- **UPDATE**: Solo datos propios
- **DELETE**: Solo datos propios

### Autenticación

- JWT tokens con expiración de 1 hora
- Refresh tokens con expiración de 7 días
- OAuth con Google y Apple

## Repositorios Relacionados

| Repositorio | Descripción |
|-------------|-------------|
| [urban-explorer-frontend](https://github.com/ismaeldosil/urban-explorer-frontend) | App móvil Ionic |
| [urban-explorer-docs](https://github.com/ismaeldosil/urban-explorer-docs) | Documentación |

## Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

<p align="center">
  Powered by <img src="https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white" alt="Supabase" height="20">
</p>
