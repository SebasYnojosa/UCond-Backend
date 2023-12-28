import { z } from "zod";

// Para la creación del condominio
export const condominioSchema = z.object({
    id_administrador: z.coerce
        .number()
        .int()
        .min(1, "Se debe especificar un id de administrador válido"),
    nombre: z.string().trim().min(1, "El nombre no puede estar vacío").max(255),
    tipo: z.enum(["Edificios", "Casas"]),
    direccion: z
        .string()
        .trim()
        .min(1, "La dirección no puede estar vacía")
        .max(255),
    url_pagina_actuarial: z.string().trim(),
});

// Para la creación de viviendas
export const viviendaSchema = z.array(
    z.object({
        nombre: z
            .string()
            .trim()
            .min(1, "El nombre de vivienda no puede estar vacío")
            .max(255),
        cedula_propietario: z
            .string()
            .trim()
            .min(1, "La cedula del propietario no puede estar vacía")
            .max(15),
        dimension: z
            .number()
            .min(1, "La dimensión de vivienda debe ser positiva"),
    }),
);

// Para agregar metodos de pago al condominio
export const metodosPagoSchema = z.array(
    z.enum(["Zelle", "Pago Movil", "Paypal", "Efectivo"]),
);
