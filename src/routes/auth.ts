/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import * as bcrypt from "bcryptjs";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import * as jwt from "jsonwebtoken";

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
        cedula: z
            .string()
            .trim()
            .min(1, "La cédula no puede estar vacía")
            .max(15),
        fecha_nacimiento: z.coerce.date(),
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

const correoPasswordSchema = z.object({
    correo: z
        .string()
        .trim()
        .email("El correo debe ser válido")
        .min(1, "El correo no puede estar vacío")
        .max(255),
    password: z
        .string()
        .trim()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .max(255),
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

        // Agregar a base de datos y devolver información
        const { confirmacion, ...usuarioBD } = parsedUser;
        const { password, ...user } = await prisma.user.create({
            data: usuarioBD,
        });

        // Iniciar sesión de usuario
        const token = jwt.sign(user, process.env.JWT_SECRET as jwt.Secret);
        res.json({ userId: user.id, token });
    } catch (error) {
        // Error de validación
        console.error(error);
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
            return res.status(400).json({ error: "El correo o cedula ya está en uso" });
        }
        // Otros errores
        res.status(500).json(error);
        console.error(error);
    }
});

/**
 * POST /api/auth/log-in
 * Inicia Sesion
 * El objeto de inicio de sesion se recibe en req.body
 */
authRouter.post("/log-in", async (req, res) => {
    try {
        //Obtener y validar cuerpo de la petición
        const parsedUser = correoPasswordSchema.parse(req.body);

        //Buscar usuario en base de datos
        const userBD = await prisma.user.findUniqueOrThrow({
            where: { correo: parsedUser.correo },
        });

        //Verificar contraseña
        const validPassword = await bcrypt.compare(
            parsedUser.password,
            userBD.password,
        );

        if (validPassword) {
            //Sacar usuario sin password
            const { password, ...usuario_sin_password } = userBD;
            const token = jwt.sign(
                usuario_sin_password,
                process.env.JWT_SECRET as jwt.Secret,
            );
            res.json({ userId: usuario_sin_password.id, token });
        } else {
            return res.status(401).json({ error: "Contraseña inválida" });
        }
    } catch (error) {
        // Error de validación
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: "Credenciales Inválidas",
                mensajes: error.issues,
            });
        }
        if (
            error instanceof PrismaClientKnownRequestError &&
            error.code === "P2025"
        ) {
            // Error correo no registrado
            return res
                .status(401)
                .json({ error: "El correo no esta registrado" });
        }
    }
});
