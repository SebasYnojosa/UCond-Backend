-- CreateTable
CREATE TABLE "Metodo_Pago" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "id_condominio" INTEGER NOT NULL,

    CONSTRAINT "Metodo_Pago_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Metodo_Pago" ADD CONSTRAINT "Metodo_Pago_id_condominio_fkey" FOREIGN KEY ("id_condominio") REFERENCES "Condominio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
