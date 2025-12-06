# Supabase Edge Functions

Este directorio contiene las Edge Functions de Supabase para Urban Explorer.

## Funciones Disponibles

### 1. `get-nearby-locations`
Busca ubicaciones cercanas usando PostGIS.

**Endpoint:** `POST /functions/v1/get-nearby-locations`

**Request Body:**
```json
{
  "lat": 40.7128,
  "lng": -74.0060,
  "radius_km": 5,
  "category_id": "uuid-opcional",
  "limit": 50
}
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Location Name",
      "description": "Description",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "123 Main St",
      "category_id": "uuid",
      "price_level": 2,
      "average_rating": 4.5,
      "review_count": 10,
      "photos": ["url1", "url2"],
      "distance_meters": 1234.56
    }
  ],
  "meta": {
    "total": 10,
    "radius_km": 5
  },
  "message": "Found 10 locations within 5km"
}
```

### 2. `update-location-stats`
Actualiza las estadísticas de una ubicación (rating promedio y cantidad de reviews).

**Endpoint:** `POST /functions/v1/update-location-stats`

**Request Body:**
```json
{
  "location_id": "uuid"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "average_rating": 4.5,
    "review_count": 10
  },
  "message": "Location stats updated successfully. Average rating: 4.5, Review count: 10"
}
```

**Uso recomendado:** Llamar esta función después de crear, actualizar o eliminar una review.

### 3. `get-user-feed`
Retorna un feed personalizado para el usuario con actividad reciente.

**Endpoint:** `POST /functions/v1/get-user-feed`

**Headers:**
```
Authorization: Bearer <user-token>
```

**Request Body:**
```json
{
  "user_id": "uuid-opcional",
  "limit": 50
}
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "review",
      "location": {
        "id": "uuid",
        "name": "Location Name",
        "description": "Description",
        "photos": ["url1"],
        "average_rating": 4.5,
        "review_count": 10,
        "address": "123 Main St"
      },
      "user": {
        "id": "uuid",
        "username": "johndoe",
        "avatar_url": "url"
      },
      "created_at": "2024-01-01T00:00:00Z",
      "rating": 5,
      "comment": "Great place!",
      "review_photos": ["url1"]
    }
  ],
  "meta": {
    "total": 10
  },
  "message": "Retrieved 10 feed items"
}
```

**Nota:** Actualmente el feed incluye actividad pública (reviews y favoritos recientes). Para implementar un feed basado en usuarios seguidos, necesitas crear una tabla `follows`.

## Desarrollo Local

### Iniciar Supabase local
```bash
supabase start
```

### Servir funciones localmente
```bash
supabase functions serve
```

### Probar una función
```bash
# get-nearby-locations
curl -i --location --request POST 'http://localhost:54321/functions/v1/get-nearby-locations' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"lat":40.7128,"lng":-74.0060,"radius_km":5}'

# update-location-stats
curl -i --location --request POST 'http://localhost:54321/functions/v1/update-location-stats' \
  --header 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"location_id":"your-location-uuid"}'

# get-user-feed
curl -i --location --request POST 'http://localhost:54321/functions/v1/get-user-feed' \
  --header 'Authorization: Bearer YOUR_USER_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{"limit":20}'
```

## Deploy

### Deploy individual function
```bash
supabase functions deploy get-nearby-locations
supabase functions deploy update-location-stats
supabase functions deploy get-user-feed
```

### Deploy todas las funciones
```bash
supabase functions deploy
```

## Variables de Entorno

Las funciones tienen acceso automático a:
- `SUPABASE_URL`: URL de tu proyecto Supabase
- `SUPABASE_ANON_KEY`: Anon key pública
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (solo usar en funciones backend)

## Manejo de Errores

Todas las funciones retornan errores en el siguiente formato:

```json
{
  "error": "Mensaje descriptivo del error",
  "code": "ERROR_CODE",
  "details": {}
}
```

Códigos de error comunes:
- `INVALID_PARAMETERS`: Parámetros faltantes o inválidos
- `UNAUTHORIZED`: Token de autenticación inválido o faltante
- `DATABASE_ERROR`: Error al consultar la base de datos
- `INTERNAL_ERROR`: Error inesperado del servidor

## Seguridad

- Todas las funciones implementan CORS
- `get-nearby-locations`: Pública (requiere anon key)
- `update-location-stats`: Requiere service role key
- `get-user-feed`: Requiere autenticación de usuario

## Logs

Ver logs de una función:
```bash
supabase functions logs get-nearby-locations --tail
```
