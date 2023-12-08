import * as jwt from "jsonwebtoken";

// Agrega información del usuario a las peticiones y respuestas de Express
declare global {
    namespace Express {
        export interface Request {
            user?: jwt.JwtPayload;
        }
        export interface Response {
            user?: jwt.JwtPayload;
        }
    }
}
