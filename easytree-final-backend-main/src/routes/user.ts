import express from "express";
import { createUser, deleteUser, updateUser} from "../services/UserService";
import { UserResource } from "../Resources";
import { body, matchedData, param, validationResult } from "express-validator";
import { requiresAuthentication } from "./authentication";
import { User } from "../model/UserModel";

const userRouter = express.Router();

/**
 * @swagger
 * /api/user:
 *   post:
 *     summary: Create a new user.
 *     tags: [User]
 *     description: Create a new user with the provided details.
 *     requestBody:
 *       required: true
 *     responses:
 *      201:
 *          description: User created successfully.
 *      400:
 *          description: Bad Request. Validation errors in the request.
 *      404:
 *          description: Not Found. Resource not found.
 *      500:
 *          description: Internal server error.
 */

/**
 * @function POST /api/user
 * @description Create a new user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
userRouter.post("/", 
body('name').isString().isLength({max: 100}).notEmpty(),
body('email').isEmail().normalizeEmail().isLength({max: 100}).notEmpty(),
body('admin').optional().isBoolean(),
body('password').isString().isLength({max: 100}).notEmpty().isStrongPassword(),
async (req, res, next) => {
    const userResource = matchedData(req) as UserResource;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = matchedData(req) as UserResource;
        const createdUserResoure = await createUser(user);
        res.status(201).send(createdUserResoure);
    } catch (err) {
        res.status(404);
        next(err);
    }
});

/**
 * @swagger
 * /api/user/{id}:
 *   put:
 *     summary: Update a user by ID.
 *     tags: [User]
 *     description: Update a user with the provided details.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to update.
 *         schema:
 *           type: string
 *           format: mongodb ObjectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: Updated Name
 *             email: updated@example.com
 *             admin: true
 *             password: UpdatedPassword123
 *     responses:
 *       '200':
 *         description: User updated successfully.
 *         content:
 *           application/json:
 *             example:
 *               id: 123
 *               name: Updated Name
 *               email: updated@example.com
 *               admin: true
 *       '400':
 *         description: Bad Request. Validation errors in the request.
 *       '403':
 *         description: Forbidden. Unauthorized access.
 *       '500':
 *         description: Internal server error.
 */

/**
 * @function PUT /api/user/:id
 * @description Update a user by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
userRouter.put("/:id", requiresAuthentication, param("id").isMongoId(),
body('id').custom((value, { req }) => value === req.params?.id).withMessage('Invalid ID'),
body('name').isString().isLength({max: 100}).notEmpty(),
body('email').isEmail().normalizeEmail().isLength({max: 100}).notEmpty(),
body('admin').optional().isBoolean(),
body('password').optional().isString().isLength({max: 100}).isStrongPassword(),
async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const userId = req.params!.userId;
        const user = matchedData(req) as UserResource;
        if (user.admin !== true) {
            return res.status(403).send("Unauthorized access");
        }
        if (userId !== user.id) {
            res.status(400);
        }
        const updatedUserResource = await updateUser(user);
        res.send(updatedUserResource);
    } catch (err) {
        res.status(400);
        next(err);
    }
});

/**
 * @swagger
 * /api/user/{id}:
 *   delete:
 *     summary: Delete a user by ID.
 *     tags: [User]
 *     description: Delete a user with the specified ID.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to delete.
 *         schema:
 *           type: string
 *           format: mongodb ObjectId
 *     responses:
 *       '204':
 *         description: User deleted successfully.
 *       '400':
 *         description: Bad Request. Validation errors in the request.
 *       '403':
 *         description: Forbidden. Unauthorized access.
 *       '404':
 *         description: Not Found. User not found.
 *       '500':
 *         description: Internal server error.
 */

/**
 * @function DELETE /api/user/:id
 * @description Delete a user by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
userRouter.delete("/:id", requiresAuthentication, param("id").isMongoId(), 
async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const userId = req.params.id;
        const user = await User.findOne({ _id: userId }).exec();
        
        if (!user) {
            return res.status(404).send("User not found");
        }
        
        if (user.id !== req.userId) {
            return res.status(403).send("Unauthorized access");
        }
        await deleteUser(userId);
        res.sendStatus(204);
    } catch (err) {
        res.status(400);
        next(err);
    }
});

export default userRouter;