import { Router } from "express";
import { anuncioSchema } from "../schemas/condominio";
import { PrismaClient } from "@prisma/client";

export const anunciosRouter = Router();
const prisma = new PrismaClient();

/**
 * PUT /anuncios/:id
 * Editar un anuncio
 */
anunciosRouter.put("/:id", async (req, res) => {
    try {
        // Validar cuerpo de la petición
        const anuncioParsed = anuncioSchema.parse(req.body);
        // Actualizar
        await prisma.anuncio.update({
            where: { id: Number(req.params.id) },
            data: anuncioParsed,
        });
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ error });
    }
});

/**
 * DELETE /anuncios/:id
 * Eliminar un anuncio
 */
anunciosRouter.delete("/:id", async (req, res) => {
    try {
        await prisma.anuncio.delete({
            where: { id: Number(req.params.id) },
        });
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ error });
    }
});
