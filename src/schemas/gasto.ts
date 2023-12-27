import { z } from "zod";

// Esquema de validación para el gasto
export const gastoSchema = z.object({
    idCondominio: z.number().int().min(1, "El id debe ser positivo"),
    monto: z.number().min(1, "El monto no puede ser negativo"),
    concepto: z
        .string()
        .trim()
        .min(1, "El concepto no puede estar vacío")
        .max(255),
    fecha_limite: z.coerce.date(),
    tipo: z.enum(["Comun", "Extraordinario"]),
    idViviendas: z
        .array(z.number().int().min(1, "El id debe ser positivo"))
        .optional(),
});
