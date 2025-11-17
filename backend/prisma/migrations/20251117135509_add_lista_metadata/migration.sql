-- AlterTable
ALTER TABLE "listas" ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "es_privada" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "idx_listas_tipo" ON "listas"("tipo_lista");
