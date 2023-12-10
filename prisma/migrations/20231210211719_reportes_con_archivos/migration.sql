/*
  Warnings:

  - You are about to drop the column `estado` on the `Reporte` table. All the data in the column will be lost.
  - Added the required column `asunto` to the `Reporte` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reporte" DROP COLUMN "estado",
ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "asunto" TEXT NOT NULL,
ADD COLUMN     "url_archivo" TEXT;
