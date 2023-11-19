// consultaUsuario.ts

import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const consultaUsuarioRouter = Router();
const prisma = new PrismaClient();

/**
 * GET /api/consultausuario/:id
 * Busca un usuario por su ID
 */
consultaUsuarioRouter.get("/:id", async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id); // Obtener el ID de los parámetros de la URL
        // Buscar usuario por ID en la base de datos
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.json(user);
    } catch (error) {
        // Manejo de errores
        res.status(500).json({ error: "Error al buscar el usuario" });
        console.error(error);
    }
});

export default consultaUsuarioRouter;
