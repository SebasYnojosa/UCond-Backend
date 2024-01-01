/*
  Warnings:

  - You are about to drop the column `monto_pagado` on the `Deuda` table. All the data in the column will be lost.
  - You are about to drop the column `monto_pagado` on the `Gasto` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Deuda" DROP COLUMN "monto_pagado";

-- AlterTable
ALTER TABLE "Gasto" DROP COLUMN "monto_pagado";
