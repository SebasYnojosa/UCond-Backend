import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

// Esquema de validacion de reportes
const reporteSchema = z.object({
    id_condominio: z
        .number()
        .min(1, "Se debe especificar la id del condominio"),
    id_usuario: z.number().min(1, "Se debe especificar la id del usuario"),
    contenido: z.string().min(1, "El reporte debe tener contenido"),
});

export const reportesRouter = Router();
const prisma = new PrismaClient();

/**
 * POST /api/reportes
 * Crea un nuevo reporte
 */

reportesRouter.post("/", async (req, res) => {
    try {
        // Verifica que el condominio existe
        const condo = await prisma.condominio.findUnique({
            where: { id: req.body.id_condominio },
            include: { viviendas: true },
        });
        if (!condo)
            return res.status(404).json({ error: "El condominio no existe" });
        
        // Verifica que el usuario existe
        const user = await prisma.user.findUnique({
            where: { id: req.body.id_usuario },
        });
        if (!user)
            return res.status(404).json({ error: "El usuario no existe" });

        // Crea el reporte
        await prisma.reporte.create({
            data: {
                ...req.body,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.issues });
        }
        res.status(500).json({ error: "Error al crear el reporte" });
        console.log(error);
    }
});
