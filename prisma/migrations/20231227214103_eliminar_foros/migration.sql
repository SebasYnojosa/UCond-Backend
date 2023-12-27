/*
  Warnings:

  - You are about to drop the `Foro` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Mensaje` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Foro" DROP CONSTRAINT "Foro_id_condominio_fkey";

-- DropForeignKey
ALTER TABLE "Mensaje" DROP CONSTRAINT "Mensaje_id_foro_fkey";

-- DropForeignKey
ALTER TABLE "Mensaje" DROP CONSTRAINT "Mensaje_id_usuario_fkey";

-- AlterTable
ALTER TABLE "Condominio" ALTER COLUMN "estado_pago" SET DEFAULT true;

-- DropTable
DROP TABLE "Foro";

-- DropTable
DROP TABLE "Mensaje";
