# Cinex Frontend

**Aplicación de Catálogo y Calificación de Películas** - Frontend en React

## 🚀 Stack Tecnológico

- **React** 19.2 - Framework de UI
- **Node.js** 24.11.0 - Versión de runtime requerida
- **Vite** 6.3.5 - Herramienta de construcción y servidor de desarrollo
- **TypeScript** 5.2.2 - Tipado estático
- **Tailwind CSS** - Estilos utility-first
- **shadcn/ui** - Librería de componentes
- **Axios** 1.13.2 - Cliente HTTP para llamadas a API
- **Sonner** - Notificaciones tipo toast
- **lucide-react** - Librería de iconos

---

## 📋 Prerrequisitos

1. **Node.js 24.11.0** (o versión compatible)
2. **Servidor Backend en ejecución** - Ver `../backend/RUN_SERVER.md`
3. **Base de datos PostgreSQL** (Railway o local) - Requerimiento del backend

---

## 🔧 Instrucciones de Configuración

### 1. Instalar Dependencias

```powershell
cd frontend
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en el directorio `frontend` (o copia desde `.env.example`):

```bash
cp .env.example .env
```

**Contenido de `.env`:**

```env
VITE_API_URL=http://localhost:5000
```

**Importante**:

- Para desarrollo local, usa `http://localhost:5000`
- El backend debe estar corriendo en este puerto
- Nunca subas el archivo `.env` al control de versiones

### 3. Iniciar Servidor de Desarrollo

```powershell
npm run dev
```

El frontend estará disponible en: **`http://localhost:3000`**

---

## 🏗️ Construcción para Producción

```powershell
npm run build
```

Directorio de salida: `build/`

**Previsualizar build de producción:**

```powershell
npm run preview
```

---

## 🧪 Prueba Rápida (Smoke Test)

**Prerrequisitos**: El backend debe estar corriendo en el puerto 5000

### Flujo de Prueba:

1. ✅ **Iniciar Backend**:

   ```powershell
   cd backend
   npm run dev
   ```

2. ✅ **Iniciar Frontend**:

   ```powershell
   cd frontend
   npm run dev
   ```

3. ✅ **Abrir Navegador**: Navegar a `http://localhost:3000`

4. ✅ **Registrar Nuevo Usuario**:

   - Click en "¿No tienes cuenta? Regístrate"
   - Llenar: Email, Nombre, Password
   - Enviar y verificar auto-login

5. ✅ **Probar Películas Populares**:

   - HomePage debe mostrar películas populares de TMDB
   - Verificar tarjetas de películas: poster, título, puntuación, año, género

6. ✅ **Probar Búsqueda**:

   - Escribir "Inception" en la barra de búsqueda
   - Verificar búsqueda con debounce
   - Los resultados deben actualizarse dinámicamente

7. ✅ **Probar Detalles de Película**:

   - Click en cualquier tarjeta de película
   - Verificar que carga la página de detalles con información completa

8. ✅ **Probar Calificación**:

   - En la página de detalles, click en las estrellas para calificar
   - Verificar notificación toast: "Calificación guardada"
   - Verificar que el promedio se actualiza

9. ✅ **Probar Listas**:

   - Click "Agregar a Por Ver" -> Verificar toast
   - Click "Mis Listas" en navegación -> Verificar pestaña "Por Ver"

10. ✅ **Probar Logout/Login**:
    - Cerrar sesión desde NavBar
    - Iniciar sesión nuevamente
    - Verificar persistencia de datos

---

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/          # Componentes React
│   │   ├── HomePage.tsx     # Página principal
│   │   ├── MovieDetail.tsx  # Detalles de película
│   │   ├── MyLists.tsx      # Listas de usuario
│   │   ├── LoginPage.tsx    # Autenticación
│   │   ├── NavBar.tsx       # Barra de navegación
│   │   ├── StarRating.tsx   # Componente de calificación
│   │   └── ui/              # Componentes shadcn/ui
│   ├── contexts/
│   │   └── AuthContext.tsx  # Manejo de estado de autenticación
│   ├── lib/
│   │   └── api.ts           # Cliente API centralizado (Axios)
│   ├── types/
│   │   └── api.ts           # Interfaces TypeScript
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Punto de entrada
│   └── index.css            # Estilos globales
├── .env                     # Variables de entorno
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md                # Este archivo
```

---

## 🔗 Integración API

### Cliente API (`src/lib/api.ts`)

Instancia centralizada de Axios con:

- **Interceptor de Request**: Inyecta token JWT automáticamente
- **Interceptor de Response**: Desenvuelve `.data`, maneja 401 (logout automático)
- **Normalización de Errores**: Retorna objetos de error consistentes

---

## 🎨 Guías de Componentes

- **TypeScript**: Modo estricto, definiciones de tipos en español/inglés (Spanglish técnico)
- **Estilos**: Tailwind CSS
- **Estado**: React Context para auth, estado local para UI
- **Accesibilidad**: Cumplimiento WCAG AA

### 🎨 Sistema de Diseño y Recursos UI

Este proyecto utiliza una arquitectura de componentes basada en un **Template de Figma** para asegurar consistencia visual y eficiencia en el desarrollo.

#### Estructura de Recursos UI (`src/components/ui/`)

La carpeta `src/components/ui/` actúa como el **núcleo del sistema de diseño**. En lugar de escribir estilos CSS desde cero para cada botón o tarjeta, la aplicación "carga" estos recursos predefinidos.

- **Centralización**: Todos los componentes base (botones, inputs, tarjetas, diálogos) viven aquí.
- **Reutilización**: Componentes complejos como `HomePage.tsx` o `MovieDetail.tsx` importan estos bloques de construcción. Por ejemplo, `MovieCard` utiliza `Card`, `Badge` y `Button` desde esta carpeta.
- **Consistencia**: Al usar estos componentes base, aseguramos que todos los botones tengan el mismo padding, efectos de hover y tipografía, tal como se definió en el diseño original.
- **Eficiencia**: El "peso" del diseño visual se carga desde estos componentes, permitiendo que la lógica de negocio se mantenga limpia en los componentes principales.

Esta estructura modular facilita la implementación de cambios globales de diseño: modificar `button.tsx` actualiza automáticamente todos los botones de la aplicación.

### 📜 Normativas y Guías de Desarrollo

Para asegurar un desarrollo alineado con las restricciones y estándares del proyecto, consultamos los siguientes documentos clave:

#### 1. Atribuciones y Licencias (`src/Attributions.md`)

Este archivo documenta el origen y las licencias de los recursos de terceros utilizados en el proyecto, garantizando el cumplimiento legal.

- **Componentes UI**: Basados en [shadcn/ui](https://ui.shadcn.com/) bajo licencia MIT.
- **Recursos Gráficos**: Imágenes provenientes de [Unsplash](https://unsplash.com) y otros proveedores con sus respectivas licencias.

#### 2. Guías de Estilo y Reglas (`src/guidelines/Guidelines.md`)

Este documento actúa como la "constitución" técnica del proyecto. Define las reglas que tanto los desarrolladores humanos como los asistentes de IA deben seguir.

- **Reglas Generales**: Estándares de código, estructura de archivos y mejores prácticas.
- **Sistema de Diseño**: Especificaciones sobre tipografía, colores, espaciado y uso correcto de componentes (ej. cuándo usar un botón primario vs. secundario).
- **Restricciones**: Lo que _no_ se debe hacer (ej. "no usar estilos inline", "no modificar componentes base sin aprobación").

**Importante**: Antes de iniciar cualquier tarea significativa, revisa `Guidelines.md` para asegurar que tu implementación cumpla con los estándares vigentes.

---

## 🐛 Solución de Problemas

### Problema: "No se puede conectar al backend"

**Solución**:

- Asegurar que el backend corre en puerto 5000
- Verificar `.env`: `VITE_API_URL=http://localhost:5000`

### Problema: Errores "401 No autorizado"

**Solución**:

- Token expirado. Cerrar e iniciar sesión nuevamente.

### Problema: Errores CORS

**Solución**:

- Verificar configuración CORS en backend (`backend/src/index.ts`)

---
