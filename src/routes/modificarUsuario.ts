import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const modificarUsuarioRouter = Router();
const prisma = new PrismaClient();

/**
 * PUT /api/modificarusuario/:id
 * Modifica un usuario por su ID, recibe el usuario
 */

modificarUsuarioRouter.put("/:id", async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id); // Obtener el ID de los parámetros de la URL
        const updatedData = req.body;
        //****Añadir validacion sobre body usuario */
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updatedData,
        });

        res.json(updatedUser);
    } catch (error) {
        //Error handling
        res.status(500).json({ error: "Error al modificar el usuario" });
    }
});

export default modificarUsuarioRouter;
