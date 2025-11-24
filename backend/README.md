# Cinex Backend

El backend de Cinex está construido con Node.js, Express, TypeScript y Prisma.

## Documentación Principal

Por favor, consulta el [README principal](../README.md) en la raíz del proyecto para obtener instrucciones detalladas sobre:

- Instalación y configuración
- Variables de entorno
- Ejecución del servidor (Dev/Prod)
- Base de datos y migraciones
- Smoke tests

## Estructura

- `src/controllers`: Lógica de negocio.
- `src/routes`: Definición de endpoints.
- `src/middleware`: Middlewares (Auth, ErrorHandler).
- `src/utils`: Utilidades (TMDB Service, JWT).
- `prisma`: Esquema de base de datos y seed.

## Prisma y Base de Datos

Cinex utiliza **Prisma ORM** para interactuar con la base de datos PostgreSQL. Prisma simplifica las consultas y el manejo de esquemas.

### ¿Qué es una Migración?

Una **migración** es un archivo SQL generado automáticamente que representa un cambio en la estructura de la base de datos (tablas, columnas, índices).

- **Por qué es necesaria**: Cada vez que modificas `prisma/schema.prisma` (ej. agregas un campo a `Usuario`), necesitas crear una migración para aplicar ese cambio a la base de datos real de manera segura y controlada.

### Comandos Principales

| Comando                   | Descripción                                                        | Cuándo usarlo                                                   |
| ------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------- |
| `npm run prisma:generate` | Genera el Cliente Prisma (tipos TS) basado en tu esquema.          | Siempre que cambies `schema.prisma` o al instalar dependencias. |
| `npm run prisma:migrate`  | Crea y aplica una nueva migración (SQL) en tu BD local.            | Cuando modificas la estructura de modelos en `schema.prisma`.   |
| `npm run prisma:seed`     | Puebla la base de datos con datos de prueba (usuarios, películas). | Para reiniciar tu entorno local con datos frescos.              |
| `npx prisma studio`       | Abre una interfaz visual en el navegador para ver/editar datos.    | Para inspeccionar datos rápidamente.                            |

### Flujo de Trabajo Típico

1. Modificar `prisma/schema.prisma`.
2. Ejecutar `npm run prisma:migrate` (te pedirá nombre para la migración).
3. El cliente se regenera automáticamente.
4. Usar el nuevo campo en tu código (`prisma.usuario.find...`).
