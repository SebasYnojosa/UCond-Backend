import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import multer from "multer";

// Esquema de validacion de reportes
const reporteSchema = z.object({
    id_condominio: z
        .number()
        .min(1, "Se debe especificar la id del condominio"),
    id_usuario: z.number().min(1, "Se debe especificar la id del usuario"),
    asunto: z.string().min(1, "El reporte debe tener un asunto").max(255),
    contenido: z.string().min(1, "El reporte debe tener contenido"),
    url_archivo: z.string().url().optional(),
});

const reportes_upload = multer({ dest: "reportes/" });

export const reportesRouter = Router();
const prisma = new PrismaClient();

/**
 * GET /api/reportes/:id/archivo
 * Devuelve el archivo del reporte
 */
reportesRouter.get("/:id/archivo", async (req, res) => {
    try {
        const reporte = await prisma.reporte.findUnique({
            where: { id: Number(req.params.id) },
        });
        if (!reporte)
            return res.status(404).json({ error: "El reporte no existe" });
        if (!reporte.url_archivo)
            return res
                .status(404)
                .json({ error: "El reporte no tiene archivo" });
        res.sendFile(reporte.url_archivo);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el archivo" });
        console.log(error);
    }
});

/**
 * POST /api/reportes
 * Crea un nuevo reporte
 */

reportesRouter.post(
    "/",
    reportes_upload.single("archivo"),
    async (req, res) => {
        try {
            // Verifica que el condominio existe
            const condo = await prisma.condominio.findUnique({
                where: { id: req.body.id_condominio },
                include: { viviendas: true },
            });
            if (!condo)
                return res
                    .status(404)
                    .json({ error: "El condominio no existe" });

            // Verifica que el usuario existe
            const user = await prisma.user.findUnique({
                where: { id: req.body.id_usuario },
            });
            if (!user)
                return res.status(404).json({ error: "El usuario no existe" });

            // Crea la URL de reporte
            const url_archivo = req.file
                ? req.protocol +
                  "://" +
                  req.get("host") +
                  "/paginas/" +
                  req.file.filename
                : null;
            const reporte = reporteSchema.parse({ ...req.body, url_archivo });

            // Crea el reporte
            const nuevoReporte = await prisma.reporte.create({
                data: {
                    ...reporte,
                },
            });
            res.json({ reporte: nuevoReporte });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: error.issues });
            }
            res.status(500).json({ error: "Error al crear el reporte" });
            console.log(error);
        }
    },
);
