-- CreateTable
CREATE TABLE "listas_personalizadas" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "descripcion" TEXT,
    "es_privada" BOOLEAN NOT NULL DEFAULT false,
    "fecha_creada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listas_personalizadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lista_personalizada_items" (
    "id" SERIAL NOT NULL,
    "lista_id" INTEGER NOT NULL,
    "pelicula_id" INTEGER NOT NULL,
    "fecha_agregada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lista_personalizada_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "idx_listas_personalizadas_nombre" ON "listas_personalizadas"("usuario_id", "nombre");
CREATE INDEX "idx_listas_personalizadas_usuario" ON "listas_personalizadas"("usuario_id");
CREATE UNIQUE INDEX "idx_lista_personalizada_items_unique" ON "lista_personalizada_items"("lista_id", "pelicula_id");
CREATE INDEX "idx_lista_personalizada_items_pelicula" ON "lista_personalizada_items"("pelicula_id");

-- AddForeignKey
ALTER TABLE "listas_personalizadas" ADD CONSTRAINT "listas_personalizadas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lista_personalizada_items" ADD CONSTRAINT "lista_personalizada_items_lista_id_fkey" FOREIGN KEY ("lista_id") REFERENCES "listas_personalizadas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lista_personalizada_items" ADD CONSTRAINT "lista_personalizada_items_pelicula_id_fkey" FOREIGN KEY ("pelicula_id") REFERENCES "peliculas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
