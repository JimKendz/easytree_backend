import express, { NextFunction, Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { Types } from "mongoose";
import { createKOPhase, getKOPhase, addUsersToKOPhase, deleteKOPhase, nextDepth } from "../services/KOPhaseService";

const kophaseRouter = express.Router();

/**
 * @swagger
 * /api/kophase:
 *   post:
 *     summary: Create a new KOPhase.
 *     tags: [KO Phase]
 *     description: Create a new Knockout Phase (KOPhase) with the given parameters.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             totalParticipants: 16
 *             participantsPerMatch: 2
 *     responses:
 *       '201':
 *         description: KOPhase created successfully.
 *         content:
 *           application/json:
 *             example:
 *               id: "kophase_id_here"
 *       '400':
 *         description: Bad Request. Validation errors in the request.
 *       '500':
 *         description: Internal Server Error.
 */

/**
 * @function POST /api/kophase
 * @description Create a new KOPhase.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
kophaseRouter.post("/",
    body("totalParticipants").isInt({ min: 1 }),
    body("participantsPerMatch").isInt({ min: 1 }),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { totalParticipants, participantsPerMatch } = req.body;
            const result = await createKOPhase(totalParticipants, participantsPerMatch);
            res.status(201).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
);

/**
 * @swagger
 * /api/kophase/{id}/addUsers:
 *   post:
 *     summary: Add users to an existing KOPhase.
 *     tags: [KO Phase]
 *     description: Add participants to an existing KOPhase by providing the KOPhase ID and a list of participants.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the KOPhase to add users to.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             participants: ["user1", "user2"]
 *     responses:
 *       '200':
 *         description: Participants added successfully.
 *         content:
 *           application/json:
 *             example:
 *               message: "Participants added successfully."
 *       '400':
 *         description: Bad Request. Validation errors in the request or participants not provided.
 *       '500':
 *         description: Internal Server Error.
 */

/**
 * @function POST /api/kophase/:id/addUsers
 * @description Add users to an existing KOPhase.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
kophaseRouter.post("/:id/addUsers", async (req: Request, res: Response) => {
    try {
        const kophaseId = new Types.ObjectId(req.params.id);
        const { participants } = req.body;
        const result = await addUsersToKOPhase(kophaseId.toString(), participants);
        res.json(result);
    } catch (error) {
        console.error(error);
        if ((error as any).errorCode) {
            res.status((error as any).errorCode).json({ error: (error as any).errorMessage });
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
});

/**
 * @swagger
 * /api/kophase/{id}/nextDepth:
 *   post:
 *     summary: Move to the next depth in a KOPhase.
 *     tags: [KO Phase]
 *     description: Move to the next depth in an existing KOPhase by providing the KOPhase ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the KOPhase to move to the next depth.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Moved to the next depth successfully.
 *         content:
 *           application/json:
 *             example:
 *               message: "Moved to the next depth successfully."
 *       '400':
 *         description: Bad Request. Validation errors in the request.
 *       '500':
 *         description: Internal Server Error.
 */

/**
 * @function POST /api/kophase/:id/nextDepth
 * @description Move to the next depth in a KOPhase.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
kophaseRouter.post("/:id/nextDepth", async (req: Request, res: Response) => {
    try {
        const kophaseId = new Types.ObjectId(req.params.id);
        const result = await nextDepth(kophaseId.toString());
        res.json(result);
    } catch (error) {
        console.error(error);
        if ((error as any).errorCode) {
            res.status((error as any).errorCode).json({ error: (error as any).errorMessage });
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
});

/**
 * @swagger
 * /api/kophase/{id}:
 *   get:
 *     summary: Get information about a specific KOPhase.
 *     tags: [KO Phase]
 *     description: Get information about a specific KOPhase by providing the KOPhase ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the KOPhase to get information about.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: KOPhase information retrieved successfully.
 *         content:
 *           application/json:
 *             example:
 *               id: "kophase_id_here"
 *               totalParticipants: 16
 *               participantsPerMatch: 2
 *       '400':
 *         description: Bad Request. Validation errors in the request.
 *       '500':
 *         description: Internal Server Error.
 */

/**
 * @function GET /api/kophase/:id
 * @description Get information about a specific KOPhase.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
kophaseRouter.get("/:id", async (req: Request, res: Response) => {
    try {
        //const kophaseId = new Types.ObjectId(req.params.id);
        const result = await getKOPhase(req.params.id);

        res.json(result);
    } catch (error) {
        console.error(error);
        if ((error as any).errorCode) {
            res.status((error as any).errorCode).json({ error: (error as any).errorMessage });
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
});

/**
 * @swagger
 * /api/kophase/{id}:
 *   delete:
 *     summary: Delete a KOPhase by ID.
 *     tags: [KO Phase]
 *     description: Delete a KOPhase by providing the KOPhase ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the KOPhase to delete.
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: KOPhase deleted successfully.
 *       '400':
 *         description: Bad Request. Validation errors in the request.
 *       '404':
 *         description: Not Found. KOPhase not found.
 *       '500':
 *         description: Internal Server Error.
 */

/**
 * @function DELETE /api/kophase/:id
 * @description Delete a KOPhase by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
kophaseRouter.delete("/:id",
    param("id").isMongoId(),
    async (req: Request, res: Response, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty) {
            return res.status(400).json({
                errors: errors.array()
            })
        }
        try {
            const result = await deleteKOPhase(req.params.id);
            res.status(204).send(result)
        } catch (err) {
            const error: Error = err as Error
            if (error.message.startsWith("ERR187")) {
                return res.status(404).json({
                    errors: [
                        {
                            location: "params",
                            msg: error.message,
                            path: "id",
                            value: req.params!.id
                        }
                    ]
                })
            }
            next(err)
        }
    });

export default kophaseRouter;
