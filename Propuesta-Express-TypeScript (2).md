# Propuesta de Proyecto Web - Segundo Curso
## CineConnect: Red Social de Películas + Backend Express + TypeScript

---

## 🎯 Concepto

Plataforma donde usuarios se registran, califican películas (1-5 estrellas), ven reseñas breves, crean listas personalizadas y descubren películas populares. **Sin chat, sin complejidad innecesaria.** Sistema completo con backend Express.js con TypeScript, frontend React y base de datos PostgreSQL en la nube.

---

## ✨ Características Principales (MVP - Mínimo Viable)

**Autenticación y Usuarios:**
- ✅ Registro e inicio de sesión con JWT
- ✅ Perfil básico del usuario (email, username)
- ✅ Logout

**Gestión de Películas:**
- ✅ Listado de películas (título, año, género, imagen) - desde API externa TMDB
- ✅ Buscar películas por título o género
- ✅ Ver detalles de cada película

**Sistema de Calificaciones:**
- ✅ Calificar película (escala 1-5 estrellas)
- ✅ Ver calificación promedio de cada película
- ✅ Ver tu calificación personal en cada película

**Listas Simples:**
- ✅ "Por Ver" - agregar/quitar películas
- ✅ "Vistas" - marcar películas como vistas
- ✅ Ver tus listas personales

**Descubrimiento:**
- ✅ Top películas (ordenadas por calificación promedio)
- ✅ Películas recientes
- ✅ Filtro por género

**Integración de API Externa (OBLIGATORIO):**
- ✅ TMDB API para obtener datos reales de películas
- ✅ Búsqueda y detalles desde API pública

---

## 💻 Stack Tecnológico

| Componente | Seleccionado |
|---|---|
| **Frontend** | React 18 |
| **Backend** | Express.js con TypeScript |
| **Runtime Node** | Node.js 18+ |
| **Base de Datos** | PostgreSQL en la Nube (Railway/Heroku/Supabase) |
| **ORM** | Prisma |
| **Autenticación** | JWT (jsonwebtoken) |
| **Validación** | Zod / class-validator |
| **API Externa** | TMDB API (obligatoria) |
| **HTTP Client** | Axios |
| **Middleware** | Express middleware estándar |
| **Hosting Backend** | Render / Railway (gratis con límites) |
| **Hosting Frontend** | Vercel / Netlify (gratis) |
| **IA Opcional** | Google Gemini Flash |

---

## 📊 Diseño de Base de Datos (PostgreSQL en Nube)

### ¿Por qué PostgreSQL en la nube?
- Requisito del profesor
- Acceso compartido desde cualquier lugar
- Escalable y profesional
- Servicios gratuitos: Railway, Render, Supabase
- Compatible con Prisma ORM

### ✅ Estado Actual: **BASE DE DATOS DESPLEGADA Y FUNCIONANDO**
- **Proveedor:** Railway (PostgreSQL)
- **Migraciones aplicadas:** 7 migraciones ejecutadas correctamente
- **Datos de prueba:** Seeding completado (3 usuarios, 6 películas, 9 calificaciones)
- **Última migración:** `20251117150000_add_lista_personalizada_tables`

### Esquema SQL (Implementado)

```sql
-- Tabla de Usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Películas
CREATE TABLE peliculas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    año INTEGER,
    genero VARCHAR(100),
    director VARCHAR(255),
    sinopsis TEXT,
    imagen_url VARCHAR(500),
    tmdb_id INTEGER UNIQUE,
    fecha_agregada TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Calificaciones
CREATE TABLE calificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    pelicula_id INTEGER NOT NULL REFERENCES peliculas(id) ON DELETE CASCADE,
    puntuacion INTEGER CHECK(puntuacion >= 1 AND puntuacion <= 5),
    comentario TEXT,
    fecha_calificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    UNIQUE(usuario_id, pelicula_id)
);

-- Tabla de Listas Predeterminadas (por_ver, vistas, favoritas)
CREATE TABLE listas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    pelicula_id INTEGER REFERENCES peliculas(id) ON DELETE CASCADE,
    tipo_lista VARCHAR(20) CHECK(tipo_lista IN ('por_ver', 'vistas', 'favoritas', 'personalizada')),
    nombre VARCHAR(255),
    descripcion TEXT,
    es_privada BOOLEAN DEFAULT FALSE,
    fecha_agregada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, pelicula_id, tipo_lista)
);

-- Tabla de Listas Personalizadas (cabecera)
CREATE TABLE listas_personalizadas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    es_privada BOOLEAN DEFAULT FALSE,
    fecha_creada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, nombre)
);

-- Tabla de Items de Listas Personalizadas
CREATE TABLE lista_personalizada_items (
    id SERIAL PRIMARY KEY,
    lista_id INTEGER NOT NULL REFERENCES listas_personalizadas(id) ON DELETE CASCADE,
    pelicula_id INTEGER NOT NULL REFERENCES peliculas(id) ON DELETE CASCADE,
    fecha_agregada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lista_id, pelicula_id)
);

-- Índices para optimización
CREATE INDEX idx_usuario_email ON usuarios(email);
CREATE INDEX idx_usuario_username ON usuarios(username);
CREATE INDEX idx_calificaciones_usuario ON calificaciones(usuario_id);
CREATE INDEX idx_calificaciones_pelicula ON calificaciones(pelicula_id);
CREATE INDEX idx_listas_usuario ON listas(usuario_id);
CREATE INDEX idx_listas_pelicula ON listas(pelicula_id);
CREATE INDEX idx_listas_tipo ON listas(tipo_lista);
CREATE INDEX idx_peliculas_genero ON peliculas(genero);
CREATE INDEX idx_peliculas_tmdb ON peliculas(tmdb_id);
CREATE INDEX idx_listas_personalizadas_usuario ON listas_personalizadas(usuario_id);
CREATE INDEX idx_lista_personalizada_items_pelicula ON lista_personalizada_items(pelicula_id);
```

---

## 🌐 Configuración de Base de Datos en la Nube

### Opción 1: Railway (Recomendada - Simple y Gratuita)
1. Crear cuenta en railway.app
2. Crear nuevo proyecto PostgreSQL
3. Obtener CONNECTION STRING
4. Guardar en archivo `.env` (nunca en GitHub):
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

### Opción 2: Render
1. Crear cuenta en render.com
2. Crear PostgreSQL Database
3. Copiar URL de conexión

### Opción 3: Supabase
1. Crear cuenta en supabase.com
2. Crear nuevo proyecto
3. Obtener JDBC URL / Connection String

---

## 📦 Configuración de Prisma

### Archivo `prisma/schema.prisma`

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Usuario {
  id        Int     @id @default(autoincrement())
  email     String  @unique
  password  String
  username  String  @unique
  createdAt DateTime @default(now())
  
  calificaciones Calificacion[]
  listas         Lista[]
}

model Pelicula {
  id          Int     @id @default(autoincrement())
  titulo      String
  año         Int?
  genero      String?
  director    String?
  sinopsis    String?
  imagenUrl   String?
  tmdbId      Int?    @unique
  createdAt   DateTime @default(now())
  
  calificaciones Calificacion[]
  listas         Lista[]
}

model Calificacion {
  id          Int     @id @default(autoincrement())
  usuarioId   Int
  peliculaId  Int
  puntuacion  Int
  createdAt   DateTime @default(now())
  
  usuario   Usuario  @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  pelicula  Pelicula @relation(fields: [peliculaId], references: [id], onDelete: Cascade)
  
  @@unique([usuarioId, peliculaId])
}

model Lista {
  id         Int     @id @default(autoincrement())
  usuarioId  Int
  peliculaId Int
  tipoLista  String  // 'por_ver' o 'vistas'
  createdAt  DateTime @default(now())
  
  usuario   Usuario  @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  pelicula  Pelicula @relation(fields: [peliculaId], references: [id], onDelete: Cascade)
}
```

### Instalación y Setup Prisma

```bash
# Instalar Prisma
npm install @prisma/client prisma

# Inicializar (si no está hecho)
npx prisma init

# Crear migración desde esquema
npx prisma migrate dev --name init

# Generar cliente Prisma
npx prisma generate
```

---

## 🛠️ Estructura del Repositorio

```
cineconnect/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── peliculasController.ts
│   │   │   └── listasController.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── peliculasRoutes.ts
│   │   │   └── listasRoutes.ts
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts
│   │   │   └── errorHandler.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── jwt.ts
│   │   │   └── tmdbService.ts
│   │   └── app.ts (Express principal)
│   │   └── server.ts (punto de entrada)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env (NO committear)
│   ├── .env.example
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api.ts (llamadas al backend)
│   │   └── App.js
│   ├── package.json
│   └── .env
├── .gitignore
├── README.md
└── docker-compose.yml (opcional)
```

---

## 📝 Configuración Express + TypeScript

### `package.json`

```json
{
  "name": "cineconnect-backend",
  "version": "1.0.0",
  "description": "Backend Express + TypeScript para CineConnect",
  "main": "dist/server.js",
  "scripts": {
    "dev": "ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@prisma/client": "^5.7.0",
    "axios": "^1.6.0",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.1.0",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.3.1",
    "zod": "^3.22.4",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.20",
    "@types/node": "^20.9.0",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcryptjs": "^2.4.6",
    "typescript": "^5.2.2",
    "ts-node": "^10.9.1",
    "@types/cors": "^2.8.17"
  }
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 💻 Código de Ejemplo Express + TypeScript

### `src/types/index.ts`

```typescript
export interface Usuario {
  id: number;
  email: string;
  username: string;
  password?: string;
}

export interface Pelicula {
  id: number;
  titulo: string;
  año?: number;
  genero?: string;
  director?: string;
  sinopsis?: string;
  imagenUrl?: string;
  tmdbId?: number;
}

export interface Calificacion {
  id: number;
  usuarioId: number;
  peliculaId: number;
  puntuacion: number;
}

export interface JWTPayload {
  id: number;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
```

### `src/utils/jwt.ts`

```typescript
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-key';

export const generateToken = (usuario: { id: number; email: string }): string => {
  return jwt.sign(
    { id: usuario.id, email: usuario.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Token inválido');
  }
};
```

### `src/middleware/authMiddleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorization = req.headers.authorization;
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const token = authorization.substring(7);
    const payload = verifyToken(token);
    
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};
```

### `src/utils/tmdbService.ts`

```typescript
import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY
  }
});

export const buscarPeliculas = async (query: string) => {
  try {
    const response = await tmdbClient.get('/search/movie', {
      params: { query }
    });
    return response.data.results.map((movie: any) => ({
      titulo: movie.title,
      año: new Date(movie.release_date).getFullYear(),
      sinopsis: movie.overview,
      imagenUrl: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      tmdbId: movie.id
    }));
  } catch (error) {
    console.error('Error buscando en TMDB:', error);
    throw error;
  }
};

export const obtenerPeliculasPopulares = async () => {
  try {
    const response = await tmdbClient.get('/movie/popular');
    return response.data.results.map((movie: any) => ({
      titulo: movie.title,
      año: new Date(movie.release_date).getFullYear(),
      sinopsis: movie.overview,
      imagenUrl: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      tmdbId: movie.id
    }));
  } catch (error) {
    console.error('Error obteniendo películas populares:', error);
    throw error;
  }
};

export const obtenerDetallePelicula = async (tmdbId: number) => {
  try {
    const response = await tmdbClient.get(`/movie/${tmdbId}`);
    const movie = response.data;
    return {
      titulo: movie.title,
      año: new Date(movie.release_date).getFullYear(),
      genero: movie.genres.map((g: any) => g.name).join(', '),
      director: movie.credits?.crew?.find((p: any) => p.job === 'Director')?.name,
      sinopsis: movie.overview,
      imagenUrl: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      tmdbId: movie.id
    };
  } catch (error) {
    console.error('Error obteniendo detalle película:', error);
    throw error;
  }
};
```

### `src/controllers/authController.ts`

```typescript
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';
import { z } from 'zod';

const prisma = new PrismaClient();

const RegistroSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6)
});

export const registro = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = RegistroSchema.parse(req.body);
    
    const usuarioExistente = await prisma.usuario.findFirst({
      where: { OR: [{ email }, { username }] }
    });
    
    if (usuarioExistente) {
      return res.status(400).json({ error: 'Usuario o email ya existe' });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    const usuario = await prisma.usuario.create({
      data: { email, username, password: passwordHash }
    });
    
    const token = generateToken(usuario);
    
    res.json({
      token,
      usuario: { id: usuario.id, email: usuario.email, username: usuario.username }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Error en registro' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const passwordValida = await bcrypt.compare(password, usuario.password);
    
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const token = generateToken(usuario);
    
    res.json({
      token,
      usuario: { id: usuario.id, email: usuario.email, username: usuario.username }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en login' });
  }
};

export const getPerfil = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'No autorizado' });
    }
    
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, username: true }
    });
    
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo perfil' });
  }
};
```

### `src/controllers/peliculasController.ts`

```typescript
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { buscarPeliculas, obtenerPeliculasPopulares } from '../utils/tmdbService';

const prisma = new PrismaClient();

export const buscar = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Parámetro q requerido' });
    }
    
    const peliculas = await buscarPeliculas(q);
    res.json(peliculas);
  } catch (error) {
    res.status(500).json({ error: 'Error en búsqueda' });
  }
};

export const getPopulares = async (req: Request, res: Response) => {
  try {
    const peliculas = await obtenerPeliculasPopulares();
    res.json(peliculas);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo películas populares' });
  }
};

export const getTop = async (req: Request, res: Response) => {
  try {
    const topPeliculas = await prisma.pelicula.findMany({
      include: {
        calificaciones: true
      },
      orderBy: {
        calificaciones: { _count: 'desc' }
      },
      take: 10
    });
    
    const resultado = topPeliculas.map(p => ({
      ...p,
      promedio: p.calificaciones.length > 0
        ? (p.calificaciones.reduce((acc, c) => acc + c.puntuacion, 0) / p.calificaciones.length).toFixed(1)
        : 0
    }));
    
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo top películas' });
  }
};
```

### `src/routes/authRoutes.ts`

```typescript
import { Router } from 'express';
import { registro, login, getPerfil } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', registro);
router.post('/login', login);
router.get('/perfil', authMiddleware, getPerfil);

export default router;
```

### `src/app.ts`

```typescript
import express, { Express } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import peliculasRoutes from './routes/peliculasRoutes';
import listasRoutes from './routes/listasRoutes';

const app: Express = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/peliculas', peliculasRoutes);
app.use('/api/listas', listasRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

export default app;
```

### `src/server.ts`

```typescript
import app from './app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Base de datos conectada');
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error conectando base de datos:', error);
    process.exit(1);
  }
}

main();
```

---

## .env.example

```env
# ==============================================
# CONFIGURACIÓN BASE DE DATOS
# ==============================================
# PostgreSQL en Railway - Conexión a la base de datos
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/nombre_base_datos

# ==============================================
# CONFIGURACIÓN JWT (Autenticación)
# ==============================================
# Clave secreta para firmar tokens JWT (mínimo 32 caracteres - REQUERIDO por validación Zod)
# Generar en: https://jwtsecretkeygenerator.com/
JWT_SECRET=tu-clave-secreta-super-segura-de-al-menos-32-caracteres

# ==============================================
# TMDB API (The Movie Database)
# ==============================================
# Clave de API de TMDB para obtener información de películas
# Obtener en: https://www.themoviedb.org/settings/api
TMDB_API_KEY=tu-api-key-de-tmdb-aqui

# ==============================================
# CONFIGURACIÓN DEL SERVIDOR
# ==============================================
# Entorno de ejecución: development | production | test
NODE_ENV=development

# Puerto donde correrá el servidor Express
PORT=5000

# ==============================================
# CONFIGURACIÓN CORS
# ==============================================
# URL del frontend para permitir peticiones CORS (puede ser múltiples separadas por coma)
FRONTEND_URL=http://localhost:3000

# ==============================================
# NOTAS IMPORTANTES
# ==============================================
# 1. NUNCA subir el archivo .env al repositorio Git
# 2. Agregar .env al archivo .gitignore
# 3. JWT_SECRET debe tener al menos 32 caracteres (validación automática)
# 4. Todas las variables son validadas al iniciar el servidor con Zod
# 5. El servidor no iniciará si falta alguna variable requerida
```

## 🚀 Cómo Ejecutar el Servidor

### Desarrollo
```powershell
cd backend
npm run dev
```
El servidor se iniciará en `http://localhost:5000` con recarga automática.

### Producción
```powershell
cd backend
npm run build
npm start
```

### Comandos de Base de Datos
```powershell
# Aplicar migraciones a producción
npx prisma migrate deploy

# Poblar base de datos con datos de prueba
npx prisma db seed

# Ver base de datos con GUI
npx prisma studio
```

### Ejecutar Smoke Tests
```powershell
cd backend
.\scripts\smoke-tests.ps1
```

Ver documentación completa en `backend/RUN_SERVER.md`

---

## 📋 Endpoints del Backend

### ✅ Estado: **TODOS LOS ENDPOINTS IMPLEMENTADOS Y FUNCIONANDO**

### Autenticación (✅ Completo)
```
POST   /api/auth/register      - Registrar usuario
POST   /api/auth/login         - Iniciar sesión
GET    /api/auth/perfil        - Ver perfil (requiere JWT)
```

### Películas (✅ Completo + Persistencia)
```
GET    /api/peliculas/buscar?q=titulo     - Buscar película (TMDB)
GET    /api/peliculas/populares           - Películas populares (TMDB)
GET    /api/peliculas/top                 - Top películas (BD local, por calificación)
GET    /api/peliculas/genero/:genero      - Filtrar por género (BD local)
GET    /api/peliculas/:id                 - Detalle de película
POST   /api/peliculas                     - Persistir película de TMDB (requiere JWT)
```

### Calificaciones (✅ Completo)
```
GET    /api/calificaciones/pelicula/:peliculaId       - Ver calificaciones de película
GET    /api/calificaciones/mi-calificacion/:peliculaId - Ver mi calificación
POST   /api/calificaciones                            - Crear calificación (requiere JWT)
PUT    /api/calificaciones/:id                        - Modificar calificación (requiere JWT)
DELETE /api/calificaciones/:id                        - Eliminar calificación (requiere JWT)
```

### Listas (✅ Completo + Listas Personalizadas)
```
# Listas predeterminadas
GET    /api/listas/mis-listas                     - Obtener todas mis listas (requiere JWT)
GET    /api/listas/:listaId                       - Detalle de lista (predeterminada o personalizada)
POST   /api/listas/por-ver/:peliculaId           - Agregar a "Por ver" (requiere JWT)
POST   /api/listas/marcar-vista/:peliculaId      - Marcar como vista (requiere JWT)
DELETE /api/listas/por-ver/:peliculaId           - Remover de "Por ver" (requiere JWT)

# Listas personalizadas
POST   /api/listas/personalizadas                                  - Crear lista personalizada (requiere JWT)
POST   /api/listas/personalizadas/:listaId/peliculas/:peliculaId  - Agregar película a lista (requiere JWT)
DELETE /api/listas/personalizadas/:listaId                         - Eliminar lista personalizada (requiere JWT)
```

### Sistema (✅ Completo)
```
GET    /                       - Health check
GET    /health                 - Health check alternativo
```

---

## 🛠️ Distribución de Trabajo (4 Personas)

**Persona 1: Backend Base + BD + Autenticación + TypeScript** ✅ **COMPLETADO**
- [x] Crear schema Prisma (7 modelos implementados)
- [x] Configurar PostgreSQL en la nube (Railway - funcionando)
- [x] Setup Express + TypeScript (compilando sin errores)
- [x] Implementar tipos TypeScript globales (todos definidos)
- [x] Endpoints de autenticación (registro, login, perfil)
- [x] JWT y middleware de autenticación (tokens 7 días)
- [x] Validación con Zod (env + payloads)
- [x] **EXTRA:** Manejo centralizado de errores con AppError
- [x] **EXTRA:** Validación de variables de entorno al iniciar
- [x] **EXTRA:** CORS configurado con múltiples orígenes

**Persona 2: Backend Películas + API Externa + Calificaciones** ✅ **COMPLETADO**
- [x] Integración TMDB API (servicio reutilizable completado)
- [x] Controllers de películas (búsqueda, populares, top desde BD)
- [x] Endpoints de calificaciones (CRUD completo)
- [x] Endpoints de listas (predeterminadas + personalizadas)
- [x] Cálculo de promedios y agregaciones con Prisma
- [x] Rutas Express organizadas por módulo
- [x] **EXTRA:** Persistencia de películas desde TMDB a BD local
- [x] **EXTRA:** Filtro de películas por género desde BD
- [x] **EXTRA:** Sistema de listas personalizadas completo
- [x] **EXTRA:** Smoke tests automatizados en PowerShell

**Persona 3: Frontend Estructura + Autenticación + Navbar**
- Setup React 18 con TypeScript
- Componentes de login/registro
- Navbar y navegación
- Protección de rutas con JWT
- Almacenamiento de token en localStorage
- Página home básica
- Configuración de Axios para llamadas API
- Context API o Redux para estado global

**Persona 4: Frontend Películas + Listas + Integración**
- Página listado de películas
- Componente de detalles película
- Búsqueda y filtros
- Componente de calificación (botones 1-5)
- Página "Por Ver" y "Vistas"
- Sistema de listas (agregar/quitar)
- Top películas
- Integración completa con backend

---

## ⏱️ Timeline Ajustado (9 Días hasta Entrega Prueba 2)

### Día 1-2 (9-10 nov): Setup Inicial
- Persona 1: Crear BD en Railway, configurar Prisma
- Persona 1: Setup Express + TypeScript + tsconfig
- Persona 1: Definir tipos TypeScript globales
- Persona 2: Estructura carpetas backend, setup TMDB service
- Persona 3: Setup React 18, carpeta estructura
- Persona 4: Crear repositorio GitHub, .gitignore, .env.example, documentación inicial
- **TODOS**: Verificar conectividad BD desde local

### Día 3-4 (11-12 nov): Autenticación + JWT
- Persona 1: Controllers y rutas de auth
- Persona 1: Middleware de autenticación
- Persona 1: Validación con Zod
- Persona 3: Componentes login/registro
- Persona 3: Context de autenticación
- Persona 3: Almacenamiento de token
- **TODOS**: Testing manual de login/registro

### Día 5 (13 nov): Películas Base + API Externa
- Persona 2: Service TMDB completamente funcional
- Persona 2: Controllers de películas (buscar, populares)
- Persona 3: Componentes de películas (listado básico)
- Persona 4: Página de detalles película
- Persona 1: Testing de endpoints

### Día 6 (14 nov): Calificaciones + Rutas Protegidas
- Persona 2: Controllers de calificaciones
- Persona 2: Rutas de calificaciones
- Persona 3: Protección de rutas en React
- Persona 4: Componente de calificación (UI)

### Día 7 (15 nov): Listas Personales
- Persona 2: Controllers y rutas de listas
- Persona 4: Páginas "Por Ver" y "Vistas"
- Persona 4: Sistema de agregar/quitar
- Persona 3: Navbar completamente funcional

### Día 8 (16 nov): Top Películas + Filtros
- Persona 2: Endpoint top películas
- Persona 2: Endpoint filtros por género
- Persona 4: Componentes top películas
- Persona 4: Sistema de filtros

### Día 9 (17 nov): Integration + Testing + Documentación
- **TODOS**: Testing completo del flujo
- Persona 1: Revisar integridad BD, documentación técnica
- **TODOS**: Escribir Readme.md (manual técnico y usuario)
- **TODOS**: Crear video demo
- **TODOS**: Pruebas edge cases

### Día 10 (18 nov): Entrega Prueba 2
- Zip con código fuente completo
- Readme.md con instrucciones paso a paso
- Sistema 100% funcional
- No binarios en zip (excluir node_modules)

---

## 🎬 Timeline Proyecto Final (25 nov)

### Días 19-21 (19-21 nov): Presentación + Documentación Avanzada
- Preparar slides con justificación comercial
- Practicar exposición sin leer diapositivas
- Manual técnico: arquitectura, endpoints, migrations Prisma
- Manual usuario con capturas
- Video demo (2-3 minutos)

### Días 22-24 (22-24 nov): Polish + Correcciones
- Corrección de bugs
- Testing completo
- Verificar funcionamiento según Readme
- Practicar presentación

### Día 25 (25 nov): Entrega Final + Presentación
- Presentación oficial (10 min)
- Demo en vivo
- Q&A
- Zip final sin binarios

---

## 💰 Costos

**Total: $0 USD**
- PostgreSQL en la nube: Railway/Render gratuito
- Express.js: npm install gratuito
- React: npm create gratuito
- TMDB API: gratuita (500 calls/día)
- JWT: incluido en jsonwebtoken
- GitHub: repositorio gratuito
- Hosting (futuro): Vercel/Netlify/Render gratis

---

## 📊 Tabla de Calificación Prueba 2 (25%)

| Item | Valor |
|---|---|
| Frontend funcional completo | 25 puntos |
| Backend funcional completo (Express + TS) | 25 puntos |
| BD en la nube funcional + Prisma | 20 puntos |
| Readme.md con instrucciones | 15 puntos |
| Sistema funciona según Readme | 15 puntos |
| Total | 100 puntos |

---

## 📊 Tabla de Calificación Proyecto Final (30%)

| Item | Valor |
|---|---|
| Funcionalidad completa | 40 puntos |
| Integración API externa (TMDB) | 20 puntos |
| Manual técnico en Readme | 10 puntos |
| Manual usuario en Readme | 10 puntos |
| Presentación y exposición | 15 puntos |
| Código limpio, tipado y documentado | 5 puntos |
| Total | 100 puntos |

---

## ⚡ INTEGRACIÓN OPCIONAL DE IA (Si les sobra tiempo)

**Opción: Recomendaciones con Google Gemini**

```typescript
// src/utils/geminiService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const obtenerRecomendacionesIA = async (peliculasFavoritas: string[]) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `El usuario ha disfrutado estas películas: ${peliculasFavoritas.join(', ')}
    
Dame 3-4 recomendaciones de películas similares.
Responde SOLO en JSON: [{"titulo": "...", "genero": "...", "razon": "..."}]`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Error con Gemini:', error);
    throw error;
  }
};
```

---

## 🚨 Riesgos Críticos (CERO AUTOMÁTICO)

- **Sin API externa integrada (TMDB)** = 0 puntos en proyecto
- **Sin BD en la nube** = 0 puntos
- **Backend no compilado o con errores TypeScript** = 0 puntos
- **Readme.md incompleto o instrucciones que no funcionan** = 0 puntos Prueba 2
- **Archivos binarios (node_modules, dist)** en zip = 0 puntos
- **Leer diapositivas en presentación** = -10 puntos
- **Sistema no funciona siguiendo Readme.md** = 0 puntos Prueba 2
- **No configurar .env correctamente** = no se compila backend

---

## ✅ Checklist Antes de Entregar

**Prueba Corta 3 (11 nov):** ✅ **COMPLETADO**
- [x] PostgreSQL en Railway funcional
- [x] Schema Prisma creado y migrado (7 migraciones)
- [x] Express + TypeScript compilando sin errores
- [x] Tipos TypeScript definidos
- [x] TMDB API integrada (todos los endpoints)
- [x] Setup React completado
- [x] Repositorio GitHub
- [x] .env.example presente
- [x] Readme preliminar

**Backend - Estado Actual (17 nov):** ✅ **COMPLETADO AL 100%**
- [x] Backend 100% funcional (TypeScript compilado)
- [x] BD en la nube con todos los datos (Railway PostgreSQL)
- [x] Integración TMDB completa (búsqueda, populares, detalles)
- [x] Autenticación con JWT implementada y probada
- [x] Sistema de listas funcional (predeterminadas + personalizadas)
- [x] Calificaciones funcionando (CRUD completo)
- [x] Validación de entorno con Zod
- [x] Manejo centralizado de errores (AppError + middleware)
- [x] CORS configurado correctamente
- [x] Persistencia de películas desde TMDB
- [x] Endpoint de género filtrado
- [x] Top películas desde BD local
- [x] Smoke tests ejecutados exitosamente
- [x] Sin archivos binarios en zip
- [x] Testing completo realizado

**Prueba 2 (18 nov):**
- [ ] Frontend 100% funcional
- [x] Backend 100% funcional ✅
- [x] BD en la nube con todos los datos ✅
- [x] Integración TMDB completa ✅
- [x] Autenticación con JWT ✅
- [x] Sistema de listas funcional ✅
- [x] Calificaciones funcionando ✅
- [ ] Readme.md con manual técnico Y usuario (backend completo, falta frontend)
- [ ] Sistema funciona exactamente como dice Readme
- [x] Sin archivos binarios en zip ✅
- [x] Testing backend completo realizado ✅

**Proyecto Final (25 nov):**
- [ ] Todo lo de Prueba 2
- [ ] Presentación preparada (10 min)
- [ ] Manual técnico detallado
- [ ] Manual usuario con capturas
- [ ] No leer diapositivas (practicado)
- [ ] Video demo (2-3 min)
- [ ] Código TypeScript con tipos completos
- [ ] Manejo de errores robusto

---

## 📚 Referencias de Documentación

- **Express**: https://expressjs.com
- **TypeScript**: https://www.typescriptlang.org
- **Prisma**: https://www.prisma.io
- **PostgreSQL**: https://www.postgresql.org
- **Railway**: https://railway.app
- **TMDB API**: https://developer.themoviedb.org
- **JWT**: https://jwt.io
- **Zod**: https://zod.dev
- **React**: https://react.dev

---

## 📞 Comunicación del Equipo

- **Repositorio GitHub**: centralizador de código
- **Branch naming**: `feature/descripcion` o `fix/descripcion`
- **Commits**: mensajes claros en español
- **Pull Requests**: revisar antes de mergear
- **Discord/WhatsApp**: comunicación diaria
- **Reuniones**: 15 min al inicio de cada sesión

---

**Actualizado**: 9 de Noviembre de 2025
**Versión**: 3.0 (Express.js + TypeScript + PostgreSQL en Nube)
