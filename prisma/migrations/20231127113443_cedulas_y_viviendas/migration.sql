/*
  Warnings:

  - You are about to drop the column `tipo` on the `Vivienda` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cedula]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cedula` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cedula_propietario` to the `Vivienda` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Vivienda" DROP CONSTRAINT "Vivienda_id_propietario_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cedula" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Vivienda" DROP COLUMN "tipo",
ADD COLUMN     "cedula_propietario" TEXT NOT NULL,
ALTER COLUMN "id_propietario" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_cedula_key" ON "User"("cedula");

-- AddForeignKey
ALTER TABLE "Vivienda" ADD CONSTRAINT "Vivienda_id_propietario_fkey" FOREIGN KEY ("id_propietario") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
