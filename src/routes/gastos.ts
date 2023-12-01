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

export const gastosRouter = Router();
const prisma = new PrismaClient();

gastosRouter.post("/", async (req, res) => {
    try {
        // Convierte el monto de string a numero
        req.body.monto = Number(req.body.monto);

        // Verifica que el id del condominio exista
        const condo = await prisma.condominio.findUnique({
            where: { id: req.body.id_condominio },
        });

        if (!condo)
            return res.status(404).json({ error: "El condominio no existe" });

        const gasto = gastoSchema.parse({ ...req.body });

        // Crea el gasto
        const nuevoGasto = await prisma.gasto.create({
            data: {
                ...gasto,
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
