import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { getMonitor } from "consulta-dolar-venezuela";
import { gastoSchema } from "../schemas/gasto";

export const gastosRouter = Router();
const prisma = new PrismaClient();

/**
 * POST /api/gastos
 * Crea un gasto en un condominio
 */
gastosRouter.post("/", async (req, res) => {
    try {
        // Verifica que el id del condominio exista
        const condo = await prisma.condominio.findUnique({
            where: { id: Number(req.body.id_condominio) },
            include: { viviendas: true },
        });
        if (!condo)
            return res.status(404).json({ error: "El condominio no existe" });

        // Agregar deudas si el gasto es comun
        const gasto = gastoSchema.parse(req.body);
        const dimensionParticular =
            gasto.tipo === "Comun"
                ? 1
                : condo.viviendas
                      .filter(
                          (vivienda) =>
                              gasto.idViviendas?.includes(vivienda.id),
                      )
                      .reduce((acc, vivienda) => acc + vivienda.dimension, 0);
        const deudas =
            gasto.tipo === "Comun"
                ? {
                      create: condo.viviendas.map((vivienda) => ({
                          cedula_usuario: vivienda.cedula_propietario,
                          monto_usuario: gasto.monto * vivienda.alicuota,
                      })),
                  }
                : {
                      create: gasto.idViviendas?.map((id) => {
                          const vivienda = condo.viviendas.find(
                              (v) => v.id === id,
                          );
                          if (!vivienda)
                              throw new Error("La vivienda no existe");
                          return {
                              cedula_usuario: vivienda.cedula_propietario,
                              monto_usuario:
                                  gasto.monto *
                                  (vivienda.dimension / dimensionParticular),
                          };
                      }),
                  };

        // Crea el gasto
        const nuevoGasto = await prisma.gasto.create({
            data: {
                monto: gasto.monto,
                concepto: gasto.concepto,
                fecha_limite: gasto.fecha_limite,
                tipo: gasto.tipo,
                id_condominio: gasto.id_condominio,
                deudas,
            },
        });
        res.json({ gasto: nuevoGasto });
    } catch (error) {
        if (error instanceof z.ZodError)
            return res
                .status(400)
                .json({ error: "Datos invalidos", mensaje: error.issues });
        console.log(error);
        res.status(500).json(error);
    }
});

/**
 * GET /api/gastos/dolarprecio
 * Obtiene el precio del dolar en bolívares
 */
gastosRouter.get("/dolarprecio", async (_req, res) => {
    try {
        const dolar = await getMonitor("bcv", "price");
        res.json({ dolar });
    } catch (error) {
        res.status(500).json({ error });
        console.log(error);
    }
});
