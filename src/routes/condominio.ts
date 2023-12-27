import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import { z } from "zod";
import { condominioSchema } from "../schemas/condominio";

// Para subir archivos
const paginas_upload = multer({
    storage: multer.diskStorage({
        destination: "pagina_actuarial/",
        filename: (_req, file, cb) => {
            const sufijo = Date.now() + "-" + Math.round(Math.random() * 1e9);
            cb(null, file.fieldname + "-" + sufijo + ".pdf");
        },
    }),
});
const comprobantes_upload = multer({ dest: "comprobantes_registro/" });

export const condominioRouter = Router();
const prisma = new PrismaClient();

/**
 * POST /api/condominios/
 * Crea un nuevo condominio
 * El objeto de condominio se recibe en req.body
 * NOTA: No incluye viviendas ni métodos de pago
 */
condominioRouter.post(
    "/",
    paginas_upload.single("pagina_actuarial"),
    async (req, res) => {
        try {
            // Verificar que haya archivo
            if (!req.file) {
                return res.status(400).json({ error: "Archivo no enviado" });
            }
            // Verificar que el archivo sea pdf
            if (req.file.mimetype !== "application/pdf") {
                return res
                    .status(400)
                    .json({ error: "El archivo debe ser PDF" });
            }

            // Parsear el id_administrador a numero
            const idAdministrador = Number(req.body.id_administrador);
            //Verificar que el id_administrador exista
            const user = await prisma.user.findUnique({
                where: { id: idAdministrador },
            });
            if (!user) {
                return res
                    .status(400)
                    .json({ error: "El id de administrador no existe" });
            }

            //Parsear condominio
            const condominio = condominioSchema.parse({
                ...req.body,
                url_pagina_actuarial: req.file.path,
            });
            const { viviendas, metodos_pago, ...datosCondominio } = condominio;
            // Calcular alícuotas
            const dimensionTotal = viviendas?.reduce(
                (acc, vivienda) => acc + vivienda.dimension,
                0,
            );
            const viviendas_con_alicuotas = viviendas
                ? viviendas.map((vivienda) => ({
                      ...vivienda,
                      alicuota: dimensionTotal
                          ? vivienda.dimension / dimensionTotal
                          : 0,
                  }))
                : [];
            // Typescript dejame quieto
            const metodos_pago_defined = metodos_pago ?? [];
            const nuevoCondominio = await prisma.condominio.create({
                data: {
                    ...datosCondominio,
                    // Inicializar la reserva en 0
                    reserva: 0,
                    viviendas: {
                        create: [...viviendas_con_alicuotas],
                    },
                    metodos_pago: {
                        create: [
                            ...metodos_pago_defined.map((m) => ({ tipo: m })),
                        ],
                    },
                },
            });
            //Registrar cada vivienda en la base de datos
            res.json({ condominio: nuevoCondominio });
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

/**
 * POST /api/condominios/:id/comprobante
 * Guarda un comprobante
 */
condominioRouter.post(
    "/:idCondominio/comprobante",
    // comprobantes_upload.single("comprobante"),
    async (req, res) => {
        try {
            // Verificar tipo de comprobante
            if (
                req.file &&
                ["image/jpeg", "application/pdf"].includes(req.file.mimetype)
            ) {
                return res
                    .status(400)
                    .json({ error: "El archivo debe ser PDF o imagen" });
            }
            // Actualizar condominio y marcar como pagado
            const idCondominio = Number(req.params.idCondominio);
            const condominio = await prisma.condominio.update({
                where: { id: idCondominio },
                data: {
                    estado_pago: true,
                },
            });
            return condominio;
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res
                    .status(400)
                    .json({ error: "Datos inválidos", mensajes: error.issues });
            }
        }
    },
);

/* DELETE /api/condominio/:id
 * Elimina un condominio por su id
 * TODO: Eliminar los registros de los gastos y la reserva?
         Autenticar que el usuario sea el administrador del condominio
 */
condominioRouter.delete("/:id", async (req, res) => {
    try {
        //parsear el id_condominio a numero
        const id = Number(req.params.id);
        const condominio = await prisma.condominio.findUnique({
            where: { id: id },
        });

        if (!condominio) {
            return res.status(404).json({ error: "El condominio no existe" });
        }

        await prisma.condominio.delete({
            where: { id: id },
        });
        res.json(condominio);
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el condominio" });
        console.error(error);
    }
});

/**
 * PUT /api/condominio/:id
 * Actualiza un condominio por su id
 * TODO: Autenticar que el usuario sea el administrador del condominio
 */
condominioRouter.put("/:id", async (req, res) => {
    try {
        //Verificar que el archivo sea pdf
        if (req.file && req.file.mimetype !== "application/pdf") {
            return res.status(400).json({ error: "El archivo debe ser PDF" });
        }
        //parsear el id_administrador a numero
        req.body.id_administrador = Number(req.body.id_administrador);

        //Verificar que el id_administrador exista
        const user = await prisma.user.findUnique({
            where: { id: req.body.id_administrador },
        });
        if (!user) {
            return res
                .status(400)
                .json({ error: "El id de administrador no existe" });
        }
        //parsear el id_condominio a numero
        const id = Number(req.params.id);

        //Verificar que el condominio exista
        let condominio = await prisma.condominio.findUnique({
            where: { id: id },
        });
        if (!condominio) {
            return res.status(404).json({ error: "El condominio no existe" });
        }

        //Crear url para el pdf
        const url_pagina_actuarial = "PaginaActuarial.pdf"; // TODO: Cambiar por URL
        const updatedCondominio = updatedCondominioSchema.parse({
            ...req.body,
            url_pagina_actuarial: url_pagina_actuarial,
        });
        //Condominio actualizado
        condominio = await prisma.condominio.update({
            where: { id: id },
            data: updatedCondominio,
        });
        res.json(condominio);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: "Datos para modificar inválidos",
                mensajes: error.issues,
            });
        }
        res.status(500).json({
            error: "Error al actualizar el condominio",
        });
        console.error(error);
    }
});

/**
 * GET /api/condominio/:id
 * Busca un condominio por su id
 */
condominioRouter.get("/:id", async (req, res) => {
    try {
        //parsear el id_condominio a numero
        const id = Number(req.params.id);

        const condominio = await prisma.condominio.findUnique({
            where: { id: id },
        });
        //Verificar que el condominio exista
        if (!condominio) {
            return res.status(404).json({ error: "El condominio no existe" });
        }
        res.json(condominio);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el condominio" });
        console.error(error);
    }
});

/**
 * GET /api/condominio/:id/inquilinos
 * Busca los inquilinos de un condominio por su id
 */
condominioRouter.get("/:id/inquilinos", async (req, res) => {
    try {
        const idCondominio = parseInt(req.params.id); // Obtener el ID de los parámetros de la URL
        // Buscar viviendas asociadas al condominio
        const viviendas_condominio = await prisma.vivienda.findMany({
            where: { id_condominio: idCondominio },
            include: { propietario: true },
        });
        // Filtrar propietarios únicos de las viviendas obtenidas
        const inquilinos = viviendas_condominio
            .map((vivienda) => vivienda.propietario)
            .filter(
                (propietario, index, self) =>
                    self.findIndex((p) => p?.id === propietario?.id) === index,
            );
        res.json({ inquilinos });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los inquilinos" });
    }
});

/**
 * GET /api/condominio/:condominioId/:userId/alicuotas
 * Busca las alicuotas de un usuario en un condominio
 */
condominioRouter.get("/:condominioId/:userId/alicuotas", async (req, res) => {
    try {
        const idCondominio = parseInt(req.params.condominioId); // Obtener el ID de los parámetros de la URL
        const idUsuario = parseInt(req.params.userId); // Obtener el ID de los parámetros de la URL
        // Buscar viviendas asociadas al condominio
        const viviendas_condominio = await prisma.vivienda.findMany({
            where: { id_condominio: idCondominio, id_propietario: idUsuario },
        });
        // Filtrar propietarios únicos de las viviendas obtenidas
        if (viviendas_condominio.length === 0) {
            return res
                .status(404)
                .json({ error: "Usuario sin viviendas en el condominio" });
        }
        const alicuotas = viviendas_condominio.map((vivienda) => ({
            id: vivienda.id,
            nombre: vivienda.nombre,
            alicuota: vivienda.alicuota,
            dimension: vivienda.dimension,
        }));
        res.json({ alicuotas });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener las alicuotas" });
    }
});

/**
 * GET /api/condominio/:id/gastos
 * Busca los gastos asociados a un condominio por id
 */
condominioRouter.get("/:id/gastos", async (req, res) => {
    try {
        const idCondominio = parseInt(req.params.id); // Obtener el ID de los parámetros de la URL
        // Buscar gastos asociados al condominio
        const gastos = await prisma.gasto.findMany({
            where: { id_condominio: idCondominio },
        });
        res.json({
            pagados: gastos.filter((g) => g.activo),
            por_pagar: gastos.filter((g) => !g.activo),
        });
    } catch (error) {
        res.status(500).json({
            error: "Error al obtener los gastos del condominio",
        });
    }
});

/**
 * POST /api/condominio/:id/gastos
 * Registra un gasto en el condominio
 */
condominioRouter.post("/:id/gastos", async (req, res) => {
    try {
        const reqGasto = gastoSchema.parse(req.body);
        const idCondominio = parseInt(req.params.id);
        // Obtener viviendas
        const viviendas = await prisma.vivienda.findMany({
            where: { id_condominio: idCondominio },
        });
        if (!viviendas.length) {
            return res.status(404).json({ error: "Condominio no encontrado" });
        }
        // Crear gasto con deudas asignadas
        const deudas = viviendas.map((v) => ({
            id_usuario: v.id_propietario,
            cedula_usuario: v.cedula_propietario,
            monto_usuario: reqGasto.monto * v.alicuota,
        }));
        const gasto = await prisma.gasto.create({
            data: {
                id_condominio: parseInt(req.params.id),
                ...reqGasto,
                deudas: {
                    create: [...deudas],
                },
            },
        });
        // Devolver gasto
        res.json({ gasto });
    } catch (error) {
        res.status(500).json({ error: "Error creando condominio" });
    }
});

/**
 * GET /api/condominio/:id/pagos
 * Busca los pagos asociados a un condominio por id
 */
condominioRouter.get("/:id/pagos", async (req, res) => {
    try {
        const idCondominio = parseInt(req.params.id); // Obtener el ID de los parámetros de la URL
        // Buscar pagos asociados al condominio
        const pagos = await prisma.pago.findMany({
            include: { deuda: { include: { gasto: true, usuario: true } } },
        });

        res.json({
            pagados: pagos
                .filter(
                    (p) =>
                        p.deuda.gasto.id_condominio === idCondominio &&
                        p.deuda.gasto.activo,
                )
                .map((p) => ({
                    id: p.id,
                    nombre_usuario: p.deuda.usuario?.nombre,
                    cedula_usuario: p.deuda.cedula_usuario,
                    monto: p.monto_pagado,
                    metodo_pago: p.metodo_pago,
                    fecha_pago: p.fecha_pago,
                    concepto: p.deuda.gasto.concepto,
                })),
            por_pagar: pagos
                .filter(
                    (p) =>
                        p.deuda.gasto.id_condominio === idCondominio &&
                        !p.deuda.gasto.activo,
                )
                .map((p) => ({
                    id: p.id,
                    nombre_usuario: p.deuda.usuario?.nombre,
                    cedula_usuario: p.deuda.cedula_usuario,
                    monto: p.monto_pagado,
                    metodo_pago: p.metodo_pago,
                    fecha_pago: p.fecha_pago,
                    concepto: p.deuda.gasto.concepto,
                })),
        });
    } catch (error) {
        res.status(500).json({
            error: "Error al obtener los pagos del condominio",
        });
    }
});

/**
 * GET /api/condominio/:id/reportes
 * Busca los reportes asociados a un condominio por id
 */
condominioRouter.get("/:id/reportes", async (req, res) => {
    try {
        const idCondominio = parseInt(req.params.id); // Obtener el ID de los parámetros de la URL
        // Buscar reportes asociados al condominio
        const reportes = await prisma.reporte.findMany({
            where: { id_condominio: idCondominio },
        });
        res.json({
            reportes,
        });
    } catch (error) {
        res.status(500).json({
            error: "Error al obtener los reportes del condominio",
        });
    }
});

/**
 * GET /api/condominio/:id/anuncios
 * Busca los anuncios asociados a un condominio por id
 */
condominioRouter.get("/:id/anuncios", async (req, res) => {
    try {
        const idCondominio = parseInt(req.params.id); // Obtener el ID de los parámetros de la URL
        // Buscar anuncios asociados al condominio
        const anuncios = await prisma.anuncio.findMany({
            where: { id_condominio: idCondominio },
            orderBy: { fecha: "desc" }, // Ordenar los anuncios por fecha de creación en orden descendente
        });
        res.json({
            anuncios,
        });
    } catch (error) {
        res.status(500).json({
            error: "Error al obtener los anuncios del condominio",
        });
    }
});
