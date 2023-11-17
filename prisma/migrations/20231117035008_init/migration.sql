-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "sexo" CHAR(1) NOT NULL,
    "telefono" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Condominio" (
    "id" SERIAL NOT NULL,
    "id_administrador" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "url_pagina_actuarial" TEXT NOT NULL,
    "reserva" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Condominio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vivienda" (
    "id" SERIAL NOT NULL,
    "id_condominio" INTEGER NOT NULL,
    "id_propietario" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "alicuota" DOUBLE PRECISION NOT NULL,
    "dimension" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Vivienda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Junta" (
    "id" SERIAL NOT NULL,
    "id_condominio" INTEGER NOT NULL,
    "id_tesorero" INTEGER NOT NULL,
    "id_presidente" INTEGER NOT NULL,
    "id_vicepresidente" INTEGER NOT NULL,
    "id_secretario" INTEGER NOT NULL,

    CONSTRAINT "Junta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gasto" (
    "id" SERIAL NOT NULL,
    "id_condominio" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "concepto" TEXT NOT NULL,
    "fecha_limite" TIMESTAMP(3) NOT NULL,
    "tipo" TEXT NOT NULL,

    CONSTRAINT "Gasto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deuda" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_gasto" INTEGER NOT NULL,
    "monto_usuario" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Deuda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" SERIAL NOT NULL,
    "id_deuda" INTEGER NOT NULL,
    "monto_pagado" DOUBLE PRECISION NOT NULL,
    "fecha_pago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metodo_pago" TEXT NOT NULL,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reporte" (
    "id" SERIAL NOT NULL,
    "id_condominio" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "contenido" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL,

    CONSTRAINT "Reporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Foro" (
    "id" SERIAL NOT NULL,
    "id_condominio" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "abierto" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Foro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mensaje" (
    "id" SERIAL NOT NULL,
    "id_foro" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "contenido" TEXT NOT NULL,
    "fecha_envio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mensaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CosaComun" (
    "id" SERIAL NOT NULL,
    "id_condominio" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "es_de_todos" BOOLEAN NOT NULL,

    CONSTRAINT "CosaComun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_cedula_key" ON "User"("cedula");

-- CreateIndex
CREATE UNIQUE INDEX "Junta_id_condominio_key" ON "Junta"("id_condominio");

-- CreateIndex
CREATE UNIQUE INDEX "Gasto_id_condominio_key" ON "Gasto"("id_condominio");

-- CreateIndex
CREATE UNIQUE INDEX "Deuda_id_usuario_key" ON "Deuda"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Deuda_id_gasto_key" ON "Deuda"("id_gasto");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_id_deuda_key" ON "Pago"("id_deuda");

-- CreateIndex
CREATE UNIQUE INDEX "Reporte_id_condominio_key" ON "Reporte"("id_condominio");

-- CreateIndex
CREATE UNIQUE INDEX "Reporte_id_usuario_key" ON "Reporte"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Foro_id_condominio_key" ON "Foro"("id_condominio");

-- CreateIndex
CREATE UNIQUE INDEX "Mensaje_id_foro_key" ON "Mensaje"("id_foro");

-- CreateIndex
CREATE UNIQUE INDEX "Mensaje_id_usuario_key" ON "Mensaje"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "CosaComun_id_condominio_key" ON "CosaComun"("id_condominio");

-- AddForeignKey
ALTER TABLE "Condominio" ADD CONSTRAINT "Condominio_id_administrador_fkey" FOREIGN KEY ("id_administrador") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vivienda" ADD CONSTRAINT "Vivienda_id_condominio_fkey" FOREIGN KEY ("id_condominio") REFERENCES "Condominio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vivienda" ADD CONSTRAINT "Vivienda_id_propietario_fkey" FOREIGN KEY ("id_propietario") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Junta" ADD CONSTRAINT "Junta_id_condominio_fkey" FOREIGN KEY ("id_condominio") REFERENCES "Condominio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Junta" ADD CONSTRAINT "Junta_id_tesorero_fkey" FOREIGN KEY ("id_tesorero") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Junta" ADD CONSTRAINT "Junta_id_presidente_fkey" FOREIGN KEY ("id_presidente") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Junta" ADD CONSTRAINT "Junta_id_vicepresidente_fkey" FOREIGN KEY ("id_vicepresidente") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Junta" ADD CONSTRAINT "Junta_id_secretario_fkey" FOREIGN KEY ("id_secretario") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_id_condominio_fkey" FOREIGN KEY ("id_condominio") REFERENCES "Condominio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deuda" ADD CONSTRAINT "Deuda_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deuda" ADD CONSTRAINT "Deuda_id_gasto_fkey" FOREIGN KEY ("id_gasto") REFERENCES "Gasto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_id_deuda_fkey" FOREIGN KEY ("id_deuda") REFERENCES "Deuda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_id_condominio_fkey" FOREIGN KEY ("id_condominio") REFERENCES "Condominio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Foro" ADD CONSTRAINT "Foro_id_condominio_fkey" FOREIGN KEY ("id_condominio") REFERENCES "Condominio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensaje" ADD CONSTRAINT "Mensaje_id_foro_fkey" FOREIGN KEY ("id_foro") REFERENCES "Foro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensaje" ADD CONSTRAINT "Mensaje_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CosaComun" ADD CONSTRAINT "CosaComun_id_condominio_fkey" FOREIGN KEY ("id_condominio") REFERENCES "Condominio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
