import { z } from "zod";

// Esquema de validación de un pago nuevo
export const pagoSchema = z.object({
    id_usuario: z.number().int().min(1, "El id de usuario debe ser positivo"),
    id_deuda: z.number().int().min(1, "El id de deuda debe ser positivo"),
    monto_pagado: z
        .number()
        .min(1, "El monto pagado debe ser mayor o igual a 1"),
    metodo_pago: z
        .string()
        .trim()
        .min(1, "El metodo de pago no puede estar vacio")
        .max(255),
    url_comprobante: z.string().trim().max(255),
    notas: z.string().trim().max(255).optional(),
    nro_referencia: z.string().trim().max(255).optional(),
});
