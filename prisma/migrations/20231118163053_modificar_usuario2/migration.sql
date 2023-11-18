/*
  Warnings:

  - You are about to drop the column `apellidos` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `cedula` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `nombres` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `sexo` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[correo]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `apellido` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correo` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha_nacimiento` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_cedula_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "apellidos",
DROP COLUMN "cedula",
DROP COLUMN "nombres",
DROP COLUMN "sexo",
ADD COLUMN     "apellido" TEXT NOT NULL,
ADD COLUMN     "correo" TEXT NOT NULL,
ADD COLUMN     "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "nombre" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_correo_key" ON "User"("correo");
