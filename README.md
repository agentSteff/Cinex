# 🎬 Cinex

**Plataforma Inteligente de Gestión y Recomendación de Películas**

Cinex es una aplicación web moderna diseñada para los amantes del cine. Permite a los usuarios explorar películas populares, gestionar listas personalizadas ("Por Ver", "Vistas", "Favoritas"), calificar títulos y recibir recomendaciones inteligentes potenciadas por IA (Gemini) basadas en sus gustos y comportamiento histórico.

---

## 🚀 Características Principales

- **Exploración de Películas**: Integración con TMDB para datos actualizados de películas.
- **Listas Inteligentes**: Gestión automática de listas "Por Ver" y "Vistas".
- **Listas Personalizadas**: Creación de listas privadas o públicas con nombres y descripciones propias.
- **Sistema de Calificaciones**: Puntuación de 1 a 5 estrellas con reseñas detalladas.
- **Recomendaciones IA**: Motor de recomendaciones personalizado basado en el historial de visualización y calificaciones del usuario.
- **Chatbot Cinéfilo**: Asistente virtual para consultas sobre cine y recomendaciones en lenguaje natural.
- **Autenticación Segura**: Sistema robusto de registro y login con JWT.

---

## 🛠️ Stack Tecnológico

- **Frontend**: React 19.2, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js 24.11.0, Express, TypeScript
- **Base de Datos**: PostgreSQL, Prisma ORM
- **IA**: Google Gemini API
- **Infraestructura**: Railway (Base de datos en la nube)

---

## 📋 Prerrequisitos

Antes de iniciar, asegúrate de tener instalado:

- **Node.js** v24.11.0 o superior
- **npm** v10 o superior
- **PostgreSQL** (local o remoto - Railway)
- **Git** (para clonar el repositorio)

---

## ⚙️ Instalación y Configuración Completa

### Paso 1: Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd Cinex
```

### Paso 2: Instalar Dependencias del Proyecto

El proyecto utiliza **npm workspaces** para gestionar frontend y backend desde la raíz.

```bash
npm install
```

Este comando instalará todas las dependencias tanto del frontend como del backend.

### Paso 3: Configurar Variables de Entorno

#### Backend (`.env` en carpeta `/backend`)

Crea un archivo `.env` en la carpeta `backend` con el siguiente contenido:

```env
# Base de Datos (PostgreSQL)
DATABASE_URL="postgresql://USUARIO:CONTRASEÑA@HOST:PUERTO/NOMBRE_BASE"

# JWT Secret (para autenticación)
JWT_SECRET="una-clave-secreta-larga-y-segura-que-tu-elijas"

# TMDB API Key (The Movie Database)
TMDB_API_KEY="TU_API_KEY_REAL_DE_TMDB"

# Google Gemini API Key (para recomendaciones IA)
GEMINI_API_KEY="TU_API_KEY_REAL_DE_GEMINI"

# Configuración del Servidor
NODE_ENV=development
PORT=5000

# CORS - URL del Frontend
FRONTEND_URL=http://localhost:3000
```

#### Frontend (`.env` en carpeta `/frontend`)

Crea un archivo `.env` en la carpeta `frontend` con el siguiente contenido:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000
```

### Paso 4: Configurar la Base de Datos (Prisma)

Navega a la carpeta del backend y genera el cliente de Prisma:

```bash
cd backend
npx prisma generate
```

Ejecuta las migraciones de la base de datos:

```bash
npx prisma migrate deploy
```

(Opcional) Poblar la base de datos con usuarios de prueba:

```bash
npm run seed
```

Regresa a la carpeta raíz del proyecto:

```bash
cd ..
```

### Paso 5: Iniciar la Aplicación

Desde la **carpeta raíz** del proyecto, ejecuta:

```bash
npm run dev
```

Este comando iniciará tanto el backend como el frontend en paralelo.

### Paso 6: Acceder a la Aplicación

Abre tu navegador y visita:

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🔑 Credenciales de Prueba

Si ejecutaste el comando `npm run seed` en el paso 4, puedes usar estas credenciales:

| Usuario       | Email             | Contraseña    |
| :------------ | :---------------- | :------------ |
| **Usuario 1** | `juan@test.com`   | `password123` |
| **Usuario 2** | `maria@test.com`  | `password123` |
| **Admin**     | `admin@cinex.com` | `password123` |

---

## 📂 Estructura del Proyecto

```
Cinex/
├── backend/                    # Servidor Express y lógica de negocio
│   ├── src/
│   │   ├── controllers/        # Controladores de rutas
│   │   ├── routes/             # Definición de endpoints API
│   │   ├── services/           # Servicios (TMDB, Gemini)
│   │   └── config/             # Configuración (env, CORS)
│   ├── prisma/
│   │   ├── schema.prisma       # Esquema de base de datos
│   │   └── seed.ts             # Datos iniciales
│   └── .env                    # Variables de entorno backend
├── frontend/                   # Aplicación React (Vite)
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   ├── contexts/           # Contextos (Auth)
│   │   ├── lib/                # Utilidades y API client
│   │   ├── types/              # Tipos TypeScript
│   │   └── guidelines/         # Guías de desarrollo
│   ├── .env                    # Variables de entorno frontend
│   └── vite.config.ts          # Configuración Vite
├── package.json                # Configuración de workspaces
├── PREPARACION_ENTREGA.md      # Guía de revisión técnica
└── README.md                   # Este archivo
```

---

## 🧪 Verificación de la Instalación

### Prueba Rápida (Smoke Test)

1. Asegúrate de que backend y frontend están corriendo
2. Abre [http://localhost:3000](http://localhost:3000)
3. Registra un nuevo usuario
4. Verifica que puedes:
   - Ver películas populares
   - Buscar películas
   - Calificar una película
   - Agregar películas a listas
   - Ver recomendaciones

### Pruebas Automáticas del Backend

```powershell
cd backend
.\scripts\smoke-tests.ps1 -BaseUrl "http://localhost:5000"
```

---

## 🐛 Solución de Problemas Comunes

### Error: "Cannot connect to database"

**Solución**: Verifica que tu `DATABASE_URL` en `backend/.env` es correcta y que PostgreSQL está corriendo.

### Error: "VITE_API_URL is not defined"

**Solución**: Asegúrate de haber creado el archivo `frontend/.env` con `VITE_API_URL=http://localhost:5000`.

### Error: "Port 5000 is already in use"

**Solución**: Cambia el puerto en `backend/.env` (ej: `PORT=5001`) y actualiza `VITE_API_URL` en `frontend/.env`.

### Los caracteres españoles no se muestran correctamente

**Solución**: Asegúrate de que tu editor está usando codificación UTF-8.

---

## 📚 Documentación Adicional

- **Backend**: Ver `backend/README.md` para detalles de la API
- **Frontend**: Ver `frontend/README.md` para guía de componentes

---

## 👨‍🎓 Estudiantes

- Fabrizzio Javier Montalto Lizano
- Sebastian Delgado Tenorio
- Jeziel Javier Oviedo Cerdas
- Stephanny Carmona Campos

---

## 👥 Créditos

- **Componentes UI**: [shadcn/ui](https://ui.shadcn.com/) (Licencia MIT)
- **Datos de Películas**: [TMDB](https://www.themoviedb.org/)
- **Imágenes**: [Unsplash](https://unsplash.com)

---