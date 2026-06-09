# ChatApp - Go + NestJS + Next.js

Chat en tiempo real desplegado en Railway.

## Arquitectura

```
Browser <--WebSocket--> Go Server (ws-server:8080)
Browser <--HTTP-------> NestJS API (api:3001)
Go Server <--HTTP-----> NestJS API (persistencia)
NestJS API <--TCP----> PostgreSQL
```

## Stack

- **ws-server**: Go + Gorilla WebSocket + Gin
- **api**: NestJS + Prisma + PostgreSQL + JWT
- **web**: Next.js 14 + Tailwind CSS

## Desarrollo Local

```bash
# Levantar todo con Docker
docker-compose up --build

# O individualmente:
# Terminal 1 - PostgreSQL
docker run -d --name pg -p 5432:5432 -e POSTGRES_DB=chatapp -e POSTGRES_USER=chatuser -e POSTGRES_PASSWORD=chatpass postgres:16-alpine

# Terminal 2 - API
cd apps/api
npx prisma db push
npm run start:dev

# Terminal 3 - WS Server
cd apps/ws-server
go run .

# Terminal 4 - Web
cd apps/web
npm run dev
```

## Deploy en Railway

1. Crear cuenta en https://railway.app
2. Crear proyecto nuevo
3. Agregar PostgreSQL como servicio
4. Crear 3 servicios (ws-server, api, web)
5. Configurar root directory para cada servicio
6. Configurar variables de entorno
7. Conectar repositorio GitHub
8. Generar dominios públicos

### Variables de Entorno

**ws-server:**
- `PORT=8080`
- `ALLOWED_ORIGINS=<frontend-domain>`

**api:**
- `PORT=3001`
- `DATABASE_URL=${{PostgreSQL.DATABASE_URL}}`
- `JWT_SECRET=<generar>`
- `ALLOWED_ORIGINS=<frontend-domain>`

**web:**
- `PORT=3000`
- `NEXT_PUBLIC_API_URL=${{api.RAILWAY_PUBLIC_DOMAIN}}`
- `NEXT_PUBLIC_WS_URL=${{ws-server.RAILWAY_PUBLIC_DOMAIN}}`

## Features

- Auth JWT (registro/login)
- Canales públicos y privados
- Mensajes en tiempo real (WebSocket)
- Direct Messages
- Typing indicators
- Reacciones con emojis
- Perfiles de usuario
- Status online/offline
- Hilos de conversación (respuestas)
- Búsqueda de mensajes
- Notificaciones del navegador
