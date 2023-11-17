import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

/**
 * Middleware para proteger rutas que solo deberían accederse autenticado
 */
export function authProtected(req: Request, res: Response, next: NextFunction) {
    try {
        // Tomar cabecera de autenticación de la petición
        const authHeader = req.headers.authorization;
        if (typeof authHeader === "string") {
            // Extraer token de autenticación
            // Es de la forma 'Bearer <token>'
            const token = authHeader.split(" ")[1];
            const user = jwt.verify(
                token,
                process.env.JWT_SECRET as jwt.Secret,
            ) as jwt.JwtPayload;
            // Agregar usuario a la petición y continuar
            req.user = user;
            next();
        } else {
            res.sendStatus(401);
        }
    } catch (error) {
        res.sendStatus(401);
    }
}
