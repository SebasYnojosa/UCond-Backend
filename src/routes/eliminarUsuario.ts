import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const eliminarUsuarioRouter = Router();
const prisma = new PrismaClient();

/**
 * DELETE /api/eliminarusuario/:id
 * Elimina un usuario por su ID
 */

eliminarUsuarioRouter.delete("/:id", async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);
        const deletedUser = await prisma.user.delete({
            where: { id: userId },
        });
        res.json(deletedUser);
    } catch (error) {
        //Error handling
        res.status(500).json({ error: "Error al eliminar el usuario" });
    }
});

export default eliminarUsuarioRouter;
