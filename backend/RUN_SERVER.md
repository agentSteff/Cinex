# 🚀 CineConnect Backend - Comandos de Servidor

## Ejecutar Servidor en Desarrollo

```powershell
cd "c:\Users\Usuario\Desktop\Proyecto Web\Cinex\backend"
npm run dev
```

El servidor se iniciará en: `http://localhost:5000`

## Ejecutar Servidor en Producción

```powershell
cd "c:\Users\Usuario\Desktop\Proyecto Web\Cinex\backend"
npm run build
npm start
```

## Comandos Útiles

### Base de Datos

```powershell
# Aplicar migraciones pendientes (producción)
npx prisma migrate deploy

# Crear nueva migración (desarrollo)
npx prisma migrate dev --name nombre_migracion

# Regenerar cliente Prisma
npx prisma generate

# Poblar base de datos con datos de prueba
npx prisma db seed

# Abrir Prisma Studio (GUI para ver datos)
npx prisma studio
```

### Testing

```powershell
# Ejecutar smoke tests
.\scripts\smoke-tests.ps1

# Ejecutar smoke tests contra otro servidor
.\scripts\smoke-tests.ps1 -BaseUrl "http://localhost:3000"
```

## Variables de Entorno Requeridas

Crear archivo `.env` con:

```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=tu-secret-key-minimo-32-caracteres
TMDB_API_KEY=tu-api-key-de-tmdb
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```

## Credenciales de Prueba (después de seed)

- **Email:** juan@test.com  
  **Password:** password123

- **Email:** maria@test.com  
  **Password:** password123

- **Email:** admin@cinex.com  
  **Password:** password123

## Endpoints Disponibles

- **Health:** `GET /`
- **Auth:** `/api/auth/*`
- **Películas:** `/api/peliculas/*`
- **Calificaciones:** `/api/calificaciones/*`
- **Listas:** `/api/listas/*`

Ver documentación completa en `Propuesta-Express-TypeScript (2).md`
