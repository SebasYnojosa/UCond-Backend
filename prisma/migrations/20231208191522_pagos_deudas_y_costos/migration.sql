/*
  Warnings:

  - Added the required column `url_comprobante` to the `Pago` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Deuda" ADD COLUMN     "monto_pagado" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Gasto" ADD COLUMN     "monto_pagado" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Pago" ADD COLUMN     "url_comprobante" TEXT NOT NULL;
