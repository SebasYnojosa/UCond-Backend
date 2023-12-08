import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const gastoSchema = z.object({
    id_condominio: z
        .number()
        .min(1, "Se debe especificar la id del condominio"),
    monto: z.number(),
    concepto: z
        .string()
        .trim()
        .min(1, "El concepto del gasto no puede estar vacio")
        .max(255),
    fecha_limite: z.coerce.date(),
    tipo: z.string().trim().min(1, "El tipo no puede estar vacio").max(255),
});

const { getMonitor } = require("consulta-dolar-venezuela");
const dolarBcv = getMonitor("bcv", "price");

export const gastosRouter = Router();
const prisma = new PrismaClient();

gastosRouter.post("/", async (req, res) => {
    try {
        // Convierte el monto de string a numero
        req.body.monto = Number(req.body.monto);

        // Verifica que el id del condominio exista
        const condo = await prisma.condominio.findUnique({
            where: { id: req.body.id_condominio },
            include: { viviendas: true },
        });
        if (!condo)
            return res.status(404).json({ error: "El condominio no existe" });

        // Agregar deudas si el gasto es comun
        const gasto = gastoSchema.parse({ ...req.body });
        const deudas =
            gasto.tipo === "comun"
                ? {
                      create: condo.viviendas.map((vivienda) => ({
                          cedula_usuario: vivienda.cedula_propietario,
                          monto_usuario: gasto.monto * vivienda.alicuota,
                      })),
                  }
                : { create: [] };

        // Crea el gasto
        const nuevoGasto = await prisma.gasto.create({
            data: {
                ...gasto,
                deudas,
            },
        });
        res.json({ gasto: nuevoGasto });
    } catch (error) {
        if (error instanceof z.ZodError)
            return res
                .status(400)
                .json({ error: "Datos invalidos", mensaje: error.issues });
        res.status(500).json(error);
        console.log(error);
    }
});

gastosRouter.get("/dolarprecio", async (_req, res) => {
    try {
        const dolar = await dolarBcv;
        res.json({ dolar });
    } catch (error) {
        res.status(500).json(error);
        console.log(error);
    }
});
