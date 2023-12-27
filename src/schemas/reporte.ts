import { z } from "zod";

// Esquema de validacion de reportes
export const reporteSchema = z.object({
    id_condominio: z
        .number()
        .min(1, "Se debe especificar la id del condominio"),
    id_usuario: z.number().min(1, "Se debe especificar la id del usuario"),
    asunto: z.string().min(1, "El reporte debe tener un asunto").max(255),
    contenido: z.string().min(1, "El reporte debe tener contenido"),
    url_archivo: z.string().url().optional(),
});