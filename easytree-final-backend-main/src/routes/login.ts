import express from "express";
import { body, matchedData, validationResult } from "express-validator";
import { LoginResource } from "../Resources";
import { verifyPasswordAndCreateJWT } from "../services/JWTService";
import { IUser } from "../model/UserModel";

const loginRouter = express.Router();


/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Authenticate user and generate JWT for login.
 *     tags: [Login]
 *     description: Authenticate a user using email and password, and generate a JWT for successful login.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: user@example.com
 *             password: user_password123
 *     responses:
 *       '201':
 *         description: Login successful. Returns access token, user name, and user id.
 *         content:
 *           application/json:
 *             example:
 *               access_token: "jwt_token_here"
 *               name: "User Name"
 *               id: "user_id_here"
 *       '400':
 *         description: Bad Request. Validation errors in the request.
 *       '401':
 *         description: Unauthorized. Invalid email or password.
 *       '404':
 *         description: Not Found. Error during login.
 *       '500':
 *         description: Internal server error.
 */

/**
 * @function POST /api/login
 * @description Authenticate user and generate JWT for login.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
loginRouter.post("/", 
body('email').isEmail().normalizeEmail().isLength({max: 100}).notEmpty(),
body('password').isString().isLength({max: 100}).notEmpty().isStrongPassword(),
async (req, res, next) => {
    const errors = validationResult(req);
    const loginResource = matchedData(req) as LoginResource;
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const login = matchedData(req) as IUser;
    const tokenAndNameAndId = await verifyPasswordAndCreateJWT(login.email, login.password);

    try {
        if (!tokenAndNameAndId) {
            return res.status(401).json({ error: errors.array()})
        }
        return res.status(201).json({ access_token: tokenAndNameAndId.token, name: tokenAndNameAndId.name, id: tokenAndNameAndId.id});
    } catch(err) {
        res.status(404);
        next();
    }
})

export default loginRouter;