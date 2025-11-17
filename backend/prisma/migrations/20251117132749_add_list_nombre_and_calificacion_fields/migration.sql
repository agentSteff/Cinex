-- AlterTable
ALTER TABLE "calificaciones" ADD COLUMN     "comentario" TEXT,
ADD COLUMN     "fechaActualizacion" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "listas" ADD COLUMN     "nombre" VARCHAR(255);
