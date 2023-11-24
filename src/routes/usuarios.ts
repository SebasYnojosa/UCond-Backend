/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const usuariosRouter = Router();
const prisma = new PrismaClient();

// Esquema de validación de usuario en peticiones
const updateUserSchema = z.object({
    nombre: z
        .string()
        .trim()
        .min(1, "El nombre no puede estar vacío")
        .max(255)
        .optional(),
    apellido: z
        .string()
        .trim()
        .min(1, "El apellido no puede estar vacío")
        .max(255)
        .optional(),
    fecha_nacimiento: z.coerce.date().optional(),
    correo: z
        .string()
        .trim()
        .email("El correo debe ser válido")
        .min(1, "El correo no puede estar vacío")
        .max(255)
        .optional(),
    telefono: z
        .string()
        .trim()
        .min(1, "El número de teléfono no puede estar vacío")
        .max(255)
        .optional(),
});

/**
 * GET /api/usuarios/:id
 * Busca un usuario por su ID
 */
usuariosRouter.get("/:id", async (req, res) => {
    try {
        const userId = parseInt(req.params.id); // Obtener el ID de los parámetros de la URL
        // Buscar usuario por ID en la base de datos
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        // Devolver el usuario en formato JSON sin la contraseña
        const { password, ...userWithoutPassword } = user;

        res.json({ user: userWithoutPassword });
    } catch (error) {
        // Manejo de errores
        res.status(500).json({ error: "Error al buscar el usuario" });
        console.error(error);
    }
});

/**
 * DELETE /api/usuarios/:id
 * Elimina un usuario por su ID
 */
usuariosRouter.delete("/:id", async (req, res) => {
    try {
        const userId = parseInt(req.params.id); // Obtener el ID de los parámetros de la URL
        // Eliminar usuario por su ID
        const deletedUser = await prisma.user.delete({
            where: { id: userId },
        });
        res.json(deletedUser);
    } catch (error) {
        //Error handling
        res.status(500).json({ error: "Error al eliminar el usuario" });
    }
});

/**
 * PUT /api/usuarios/:id
 * Modifica un usuario por su ID, recibe el usuario
 */
usuariosRouter.put("/:id", async (req, res) => {
    try {
        const userId = parseInt(req.params.id); // Obtener el ID de los parámetros de la URL
        const updatedData = updateUserSchema.parse(req.body);
        // Añadir validacion sobre body usuario
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updatedData,
        });
        res.json({ user: updatedUser });
    } catch (error) {
        //Error handling
        res.status(500).json({ error: "Error al modificar el usuario" });
    }
});

export { usuariosRouter };
