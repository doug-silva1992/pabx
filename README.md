# pabx

Monorepo com **Laravel 13** (API + Swagger) e **React 19 + Vite** (frontend), rodando com Docker.

## Estrutura

```
backend/   Laravel + L5-Swagger (OpenAPI)
frontend/  React + TypeScript + Vite
docker-compose.yml
```

## Subir o ambiente

```bash
docker compose up -d --build
```

| Serviço      | URL                                       |
|--------------|-------------------------------------------|
| Frontend     | http://localhost:5174                     |
| API          | http://localhost:8000/api                 |
| Swagger UI   | http://localhost:8000/api/documentation   |
| MySQL        | localhost:3306 (pabx / secret)            |

As portas podem ser alteradas com `FRONTEND_PORT`, `BACKEND_PORT` e `DB_PORT` (ex.: num arquivo `.env` na raiz).

## Como frontend e backend se conectam

O dev server do Vite faz proxy de `/api` e `/docs` para o Laravel
(`frontend/vite.config.ts`). No React basta chamar `fetch('/api/...')`, sem CORS.

## Documentando endpoints no Swagger

Use atributos do `swagger-php` nos controllers (veja `backend/app/Http/Controllers/Api/HealthController.php`).
A documentação é regerada a cada requisição no Docker (`L5_SWAGGER_GENERATE_ALWAYS=true`), ou manualmente:

```bash
docker compose exec backend php artisan l5-swagger:generate
```

## Comandos úteis

```bash
docker compose exec backend php artisan migrate
docker compose exec backend composer require <pacote>
docker compose exec frontend npm install <pacote>
docker compose logs -f backend
docker compose down
```
