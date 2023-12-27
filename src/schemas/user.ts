import { z } from "zod";

// Esquema de validación de usuario en registro
export const userSchema = z
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

// Esquema para validar el login
export const correoPasswordSchema = z.object({
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

// Esquema de validación de usuario en peticiones de actualización
export const updateUserSchema = z.object({
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
