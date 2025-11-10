/*
  Warnings:

  - You are about to drop the column `comentario` on the `calificaciones` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `calificaciones` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `calificaciones` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `listas` table. All the data in the column will be lost.
  - You are about to alter the column `tipo_lista` on the `listas` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to drop the column `anio` on the `peliculas` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `peliculas` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `peliculas` table. All the data in the column will be lost.
  - You are about to alter the column `titulo` on the `peliculas` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `genero` on the `peliculas` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `director` on the `peliculas` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `imagen_url` on the `peliculas` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to drop the column `created_at` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `usuarios` table. All the data in the column will be lost.
  - You are about to alter the column `email` on the `usuarios` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `password` on the `usuarios` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `username` on the `usuarios` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE "calificaciones" DROP COLUMN "comentario",
DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "fecha_calificacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "listas" DROP COLUMN "created_at",
ADD COLUMN     "fecha_agregada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "tipo_lista" SET DATA TYPE VARCHAR(20);

-- AlterTable
ALTER TABLE "peliculas" DROP COLUMN "anio",
DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "año" INTEGER,
ADD COLUMN     "fecha_agregada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "titulo" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "genero" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "director" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "imagen_url" SET DATA TYPE VARCHAR(500);

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "password" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "username" SET DATA TYPE VARCHAR(100);

-- CreateIndex
CREATE INDEX "idx_calificaciones_usuario" ON "calificaciones"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_calificaciones_pelicula" ON "calificaciones"("pelicula_id");

-- CreateIndex
CREATE INDEX "idx_listas_usuario" ON "listas"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_listas_pelicula" ON "listas"("pelicula_id");

-- CreateIndex
CREATE INDEX "idx_peliculas_genero" ON "peliculas"("genero");

-- CreateIndex
CREATE INDEX "idx_peliculas_tmdb" ON "peliculas"("tmdb_id");

-- CreateIndex
CREATE INDEX "idx_usuario_email" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "idx_usuario_username" ON "usuarios"("username");
