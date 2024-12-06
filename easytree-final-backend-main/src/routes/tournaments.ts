import express from "express";
import { getTournaments, getTournamentsWhereUserIsAdmin, getTournamentsWhereUserIsParticipant } from "../services/TournamentService";
import { TournamentResource } from "../Resources";
import { validationResult } from "express-validator";
import { requiresAuthentication } from "./authentication";


const tournamentsRouter = express.Router();

/**
 * @swagger
 * /api/tournaments:
 *   get:
 *     summary: Get a list of tournaments.
 *     tags: [Tournaments]
 *     description: Retrieve a list of tournaments from the database.
 *     responses:
 *       '200':
 *         description: A successful response with the list of tournaments.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 name: Tournament 1
 *                 date: 2024-01-21
 *               - id: 2
 *                 name: Tournament 2
 *                 date: 2024-01-22
 *       '400':
 *         description: Bad Request. Validation errors in the request.
 *       '404':
 *         description: Not Found. No tournaments available in the database.
 *       '500':
 *         description: Internal server error.
 */

/**
 * @function GET /api/tournaments
 * @description Get a list of tournaments.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
tournamentsRouter.get("/",
    async (req, res, next) => {
        //error handling
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
        try {
            let tournies = await getTournaments()
            res.status(200).send(tournies);
        }
        catch (err) {
            const error: Error = err as Error
            if(error.message.startsWith("Error TS16")){ 
                return res.status(404).json({
                    errors: [
                        {
                            location: "Database",
                            msg: error.message,
                            path: "Database",
                            value: "No Data"
                        }
                    ]
                })
            }
            next(err)
        }
    })

/**
 * @swagger
 * /api/tournaments/myTournamentsAdmin:
 *   get:
 *     summary: Get tournaments where the user is an admin.
 *     tags: [Tournaments]
 *     description: Retrieve tournaments where the authenticated user is an admin.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: A successful response with the list of tournaments.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 name: Tournament 1
 *                 date: 2024-01-21
 *               - id: 2
 *                 name: Tournament 2
 *                 date: 2024-01-22
 *       '400':
 *         description: Bad Request. Validation errors in the request.
 *       '403':
 *         description: Forbidden. Unauthorized access.
 *       '500':
 *         description: Internal server error.
 */

/**
 * @function GET /api/tournaments/myTournamentsAdmin
 * @description Get tournaments where the user is an admin.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
tournamentsRouter.get("/myTournamentsAdmin", requiresAuthentication,
async (req, res, next) => {
    //error handling
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    if (req.userId === undefined) {
        return res.status(400).send("Error TR052: No UserID found through requires Atuhentication");
    }
    // updating the Tournament / adding requesting User to participants array
    try {
        let usersTournies = await getTournamentsWhereUserIsAdmin(req.userId)
        res.send(usersTournies);
    } catch (err) {
        res.status(400);
        next(err);
    }
});

/**
 * @swagger
 * /api/tournaments/myTournamentsParticipant:
 *   get:
 *     summary: Get tournaments where the user is a participant.
 *     tags: [Tournaments]
 *     description: Retrieve tournaments where the authenticated user is a participant.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: A successful response with the list of tournaments.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 name: Tournament 1
 *                 date: 2024-01-21
 *               - id: 2
 *                 name: Tournament 2
 *                 date: 2024-01-22
 *       '400':
 *         description: Bad Request. Validation errors in the request.
 *       '403':
 *         description: Forbidden. Unauthorized access.
 *       '500':
 *         description: Internal server error.
 */

/**
 * @function GET /api/tournaments/myTournamentsParticipant
 * @description Get tournaments where the user is a participant.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
tournamentsRouter.get("/myTournamentsParticipant", requiresAuthentication,
async (req, res, next) => {
    //error handling
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    if (req.userId === undefined) {
        return res.status(400).send("Error TR052: No UserID found through requires Atuhentication");
    }
    // updating the Tournament / adding requesting User to participants array
    try {
        let usersTournies = await getTournamentsWhereUserIsParticipant(req.userId)
        res.send(usersTournies);
    } catch (err) {
        res.status(400);
        next(err);
    }
});


export default tournamentsRouter;