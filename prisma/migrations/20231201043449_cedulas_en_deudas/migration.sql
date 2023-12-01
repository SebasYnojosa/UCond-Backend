/*
  Warnings:

  - A unique constraint covering the columns `[cedula_usuario]` on the table `Deuda` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cedula_usuario` to the `Deuda` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Deuda" DROP CONSTRAINT "Deuda_id_usuario_fkey";

-- AlterTable
ALTER TABLE "Deuda" ADD COLUMN     "cedula_usuario" TEXT NOT NULL,
ALTER COLUMN "id_usuario" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Deuda_cedula_usuario_key" ON "Deuda"("cedula_usuario");

-- AddForeignKey
ALTER TABLE "Deuda" ADD CONSTRAINT "Deuda_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
