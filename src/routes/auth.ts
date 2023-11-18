import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import * as bcrypt from "bcryptjs";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

// Esquema de validación de usuario en peticiones
const userSchema = z
    .object({
        nombre: z
            .string()
            .trim()
            .min(1, "El nombre no puede estar vacío")
            .max(255),
        apellido: z
            .string()
            .trim()
            .min(1, "El apellido no puede estar vacío")
            .max(255),
        fecha_nacimiento: z.date(),
        correo: z
            .string()
            .trim()
            .email("El correo debe ser válido")
            .min(1, "El correo no puede estar vacío")
            .max(255),
        telefono: z
            .string()
            .trim()
            .min(1, "El número de teléfono no puede estar vacío")
            .max(255),
        password: z
            .string()
            .trim()
            .min(8, "La contraseña debe tener al menos 8 caracteres")
            .max(255),
        confirmacion: z.string().trim(),
    })
    .refine((user) => user.password === user.confirmacion, {
        message: "La contraseña y su confirmación no coinciden",
        path: ["confirmacion"],
    });

// Router que tendrá todas las rutas referentes a la autenticación
export const authRouter = Router();
const prisma = new PrismaClient();

/**
 * POST /api/auth/sign-up
 * Crea un nuevo usuario
 * El objeto de usuario se recibe en req.body
 */
authRouter.post("/sign-up", async (req, res) => {
    try {
        // Obtener y validar cuerpo de la petición
        const parsedUser = userSchema.parse(req.body);
        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        parsedUser.password = await bcrypt.hash(parsedUser.password, salt);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { confirmacion, ...usuarioBD } = parsedUser;
        // Agregar a base de datos y devolver información
        const user = await prisma.user.create({ data: usuarioBD });
        res.json(user);
    } catch (error) {
        // Error de validación
        if (error instanceof z.ZodError) {
            return res
                .status(400)
                .json({ error: "Datos inválidos", mensajes: error.issues });
        }
        // Error por correo
        if (
            error instanceof PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return res.status(400).json({ error: "El correo ya está en uso" });
        }
        // Otros errores
        res.status(500).json(error);
        console.error(error);
    }
});
