-- CreateTable
CREATE TABLE "Anuncio" (
    "id" SERIAL NOT NULL,
    "asunto" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "id_condominio" INTEGER NOT NULL,

    CONSTRAINT "Anuncio_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Anuncio" ADD CONSTRAINT "Anuncio_id_condominio_fkey" FOREIGN KEY ("id_condominio") REFERENCES "Condominio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
