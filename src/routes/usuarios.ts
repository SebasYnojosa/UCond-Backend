/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import multer from "multer";

const usuariosRouter = Router();
const prisma = new PrismaClient();

// Esquema de validación de un pago nuevo
const pagoSchema = z.object({
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
});

const comprobantes_usuario_upload = multer({ dest: "comprobantes_usuario/" });

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

/**
 * GET /api/usuarios/:userId/condominios
 * Busca los condominios de un usuario por su ID
 */
usuariosRouter.get("/:userId/condominios", async (req, res) => {
    try {
        const userId = parseInt(req.params.userId); // Obtener el ID de los parámetros de la URL
        const viviendas_usuario = await prisma.vivienda.findMany({
            where: { id_propietario: userId },
            include: { condominio: true },
        });
        // Filtrar todos los condominios únicos de las viviendas del usuario
        const condominios = viviendas_usuario
            .map((vivienda) => vivienda.condominio)
            .filter(
                (condominio, index, self) =>
                    self.findIndex((c) => c.id === condominio.id) === index,
            );
        res.json({ condominios });
    } catch (error) {
        res.status(500).json({
            error: "Error al buscar los condominios del usuario",
        });
    }
});

/**
 * GET /api/usuarios/:userId/deudas?idCondominio=<idCondominio>
 * Busca las deudas de un usuario por su ID
 */
usuariosRouter.get("/:userId/deudas", async (req, res) => {
    try {
        // Obtener el ID de los parámetros de la URL
        const userId = parseInt(req.params.userId);
        // Buscar usuario por ID en la base de datos
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { deudas: true },
        });
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        // Trabajo extra si se especifica la id del condominio
        if (req.query.idCondominio) {
            const idCondominio = parseInt(req.query.idCondominio as string);
            // Buscar condominio por ID en la base de datos
            const condominio = await prisma.condominio.findUnique({
                where: { id: idCondominio },
                include: { gastos: true },
            });
            if (!condominio) {
                return res
                    .status(404)
                    .json({ error: "Condominio no encontrado" });
            }
            // Devolver deudas activas que pertenezcan al condominio
            return res.json({
                deudas: user.deudas.filter(
                    (deuda) =>
                        deuda.activa &&
                        condominio.gastos.some(
                            (gasto) => gasto.id === deuda.id_gasto,
                        ),
                ),
            });
        }
        // Devolver las deudas activas del usuario
        res.json({ deudas: user.deudas.filter((deuda) => deuda.activa) });
    } catch (error) {
        // Manejo de errores
        console.log(error);
        res.status(500).json({
            error,
        });
    }
});

/**
 * GET /api/usuarios/:userId/pagos?idCondominio=<idCondominio>
 * Busca el historial de pagos de un usuario por su ID
 */
usuariosRouter.get("/:userId/pagos", async (req, res) => {
    try {
        // Obtener id de los parámetros
        const userId = parseInt(req.params.userId);
        // Buscar usuario por ID en la base de datos
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { deudas: { include: { pagos: true } } },
        });
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        // Trabajo extra si se especifica la id del condominio
        if (req.query.idCondominio) {
            const idCondominio = parseInt(req.query.idCondominio as string);
            // Buscar condominio por ID en la base de datos
            const condominio = await prisma.condominio.findUnique({
                where: { id: idCondominio },
                include: { gastos: true },
            });
            if (!condominio) {
                return res
                    .status(404)
                    .json({ error: "Condominio no encontrado" });
            }
            // Devolver pagos que pertenezcan al condominio
            const deudasConConcepto = [];
            for (const deuda of user.deudas) {
                const gasto = condominio.gastos.find(
                    (gasto) => gasto.id === deuda.id_gasto,
                );
                if (gasto) {
                    deudasConConcepto.push({
                        ...deuda,
                        concepto: gasto.concepto,
                    });
                }
            }
            return res.json({
                pagos: deudasConConcepto.flatMap((deuda) =>
                    deuda.pagos.map((pago) => ({
                        ...pago,
                        concepto: deuda.concepto,
                    })),
                ),
            });
        }
    } catch (error) {
        // Manejo de errores
        console.log(error);
        res.status(500).json({
            error,
        });
    }
});

/**
 * POST /api/usuarios/:userId/pagos
 * Agrega un pago
 */
usuariosRouter.post(
    "/:userId/pagos",
    comprobantes_usuario_upload.single("comprobante"),
    async (req, res) => {
        try {
            //Verificar que el archivo sea pdf
            if (req.file && req.file.mimetype !== "image/jpeg") {
                return res
                    .status(400)
                    .json({ error: "El archivo debe ser de imagen" });
            }
            //Parsear el id_usuario a número
            req.body.id_usuario = Number(req.body.id_usuario);

            //Verificar que el id_usuario exista
            const user = await prisma.user.findUnique({
                where: { id: req.body.id_usuario },
            });
            if (!user) {
                return res.status(400).json({ error: "El usuario no existe" });
            }

            //Crear url para el pdf
            const url_comprobante =
                req.protocol +
                "://" +
                req.get("host") +
                "/comprobantes_usuario/" +
                (req.file ? req.file.filename : "");
            //Parsear pago
            const pago = pagoSchema.parse({
                ...req.body,
                url_comprobante,
            });
            // Obtener informacion de deuda
            const deuda = await prisma.deuda.findUnique({
                where: { id: pago.id_deuda },
                include: { gasto: true },
            });
            if (!deuda) {
                return res.status(404).json({ error: "Deuda no encontrada" });
            }
            // Registrar pago
            const [pagoCreado, _deudaActualizada, _gastoActualizado] =
                await prisma.$transaction([
                    prisma.pago.create({ data: { ...pago } }),
                    prisma.deuda.update({
                        where: { id: pago.id_deuda },
                        data: {
                            monto_pagado:
                                deuda.monto_pagado + pago.monto_pagado,
                            activa:
                                deuda.monto_pagado + pago.monto_pagado <
                                deuda.monto_usuario,
                        },
                    }),
                    prisma.gasto.update({
                        where: { id: deuda.gasto.id },
                        data: {
                            monto_pagado:
                                deuda.gasto.monto_pagado + pago.monto_pagado,
                            activo:
                                deuda.gasto.monto_pagado + pago.monto_pagado <
                                deuda.gasto.monto,
                        },
                    }),
                ]);
            res.json({ pago: pagoCreado });
        } catch (error) {
            //Error de validacion
            if (error instanceof z.ZodError) {
                return res
                    .status(400)
                    .json({ error: "Datos inválidos", mensajes: error.issues });
            }
            res.status(500).json(error);
            console.error(error);
        }
    },
);

export { usuariosRouter };
