import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import multer from "multer";
import { reporteSchema } from "../schemas/reporte";

// Para cargar archivos
const reportes_upload = multer({
    storage: multer.diskStorage({
        destination: "public/reportes",
        filename: (_req, file, cb) => {
            const prefijo = Date.now() + "-" + Math.round(Math.random() * 1e9);
            cb(null, prefijo + "-" + file.originalname);
        },
    }),
});

export const reportesRouter = Router();
const prisma = new PrismaClient();

/**
 * GET /api/reportes/:id
 * Devuelve el reporte de id :id
 */
reportesRouter.get("/:id", async (req, res) => {
    try {
        const reporte = await prisma.reporte.findUnique({
            where: { id: Number(req.params.id) },
        });
        if (!reporte)
            return res.status(404).json({ error: "El reporte no existe" });
        res.json({ reporte });
    } catch (error) {
        res.status(500).json({ error });
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

            // Crea el reporte
            const nuevoReporte = await prisma.reporte.create({
                data: reporteSchema.parse({
                    ...req.body,
                    url_archivo: req.file?.path,
                }),
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
