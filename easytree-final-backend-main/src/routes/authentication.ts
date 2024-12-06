import { NextFunction, Request, Response } from "express";
import { verifyJWT } from "../services/JWTService";
/**
 * Typdefinitionen für TypeScript.
 */
declare global {
    namespace Express {
        /**
         * Wir erweitern das Interface `Request` um die Felder `userId` und `role`.
         * Das ist nur für TypeScript wichtig, damit wir später auf diese Felder ohne 
         * Compiler-Fehler zugreifen können.
         */
        export interface Request {
            /**
             * Mongo-ID of currently logged in user; or undefined, if user is a guest.
             */
            userId?: string;
            name: string;
            role: "u" | "a";
        }
    }
}

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 * 
 * @function requiresAuthentication
 * @description Middleware that checks for user authentication and updates request object.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export async function requiresAuthentication(req: Request, res: Response, next: NextFunction) {
    //https://www.tabnine.com/code/javascript/functions/http/IncomingHttpHeaders/authorization
    req.userId = undefined;
    const auth = req.headers.cookie
    if (auth) {
        try {
            const info = verifyJWT(auth);
            if (info) {
                req.userId = info.userId;
                req.name = info.name
                req.role=info.role;
            }
            next()
        } catch (err) {
            /**
             * @swagger
             * responses:
             *   401:
             *     description: Unauthorized
             *     headers:
             *       WWW-Authenticate:
             *         description: Bearer realm="app" error="invalid_token"
             *         schema:
             *           type: array
             *           items:
             *             type: string
             */
            res.status(401); // Unauthorized
            res.setHeader("WWW-Authenticate", ['Bearer', 'realm="app"', 'error="invalid_token"']);
            next(err);
        }
    } else {
        /**
         * @swagger
         * responses:
         *   401:
         *     description: Unauthorized
         *     headers:
         *       WWW-Authenticate:
         *         description: Bearer realm="app"
         *         schema:
         *           type: array
         *           items:
         *             type: string
         */
        res.status(401); // Unauthorized
        res.setHeader("WWW-Authenticate", ['Bearer', 'realm="app"']);
        next("Authentication required");
    }
}

/**
 * @function optionalAuthentication
 * @description Middleware that optionally checks for user authentication.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export async function optionalAuthentication(req: Request, res: Response, next: NextFunction) {
    const auth = req.headers.authorization?.split(" ")[1];
    if (!auth) {
        return next();
    }

    try {
        const decodedToken = verifyJWT(auth);
        req.userId = decodedToken.userId;
        req.role = decodedToken.role;
        next();
    } catch (error) {
        /**
         * @swagger
         * responses:
         *   401:
         *     description: Unauthorized
         */
        res.status(401);
        next(error);
    }
}