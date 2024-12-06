import express from "express";
import { createTournament, deleteTournament, updateTournament, addParticipant, getTournamentByID, getTournaments, getCompleteTournamentResourceByID } from "../services/TournamentService";
import { TournamentResource } from "../Resources";
import { body, matchedData, param, validationResult } from "express-validator";
import { requiresAuthentication } from "./authentication";
import { Tournament } from "../../src/model/TournamentModel";
import { createKOPhase } from "../../src/services/KOPhaseService";
import { TOURNAMENTSTATE } from "../../src/Enum";

const tournamentRouter = express.Router();

/**
 * @swagger
 * /api/tournaments:
 *   post:
 *     summary: Create a new Tournament.
 *     tags: [Tournament]
 *     description: Create a new tournament with the provided details.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: Tournament Name
 *             description: Tournament Description
 *             startDate: 2024-01-21
 *             public: true
 *             tags: ["tag1", "tag2"]
 *             admins: ["adminUserID1", "adminUserID2"]
 *             participants: ["participantUserID1", "participantUserID2"]
 *             tournamentSystem: ["tournamentSystemID"]
 *             totalParticipants: 16
 *             participantsPerMatch: 4
 *             tournamentState: "signUpPhase"
 *     responses:
 *       '201':
 *         description: Tournament created successfully.
 *         content:
 *           application/json:
 *             example:
 *               id: 123
 *               name: Tournament Name
 *               description: Tournament Description
 *               startDate: 2024-01-21
 *               public: true
 *               tags: ["tag1", "tag2"]
 *               admins: ["adminUserID1", "adminUserID2"]
 *               participants: ["participantUserID1", "participantUserID2"]
 *               tournamentSystem: ["tournamentSystemID"]
 *               totalParticipants: 16
 *               participantsPerMatch: 4
 *               tournamentState: "signUpPhase"
 *       '400':
 *         description: Bad Request. Validation errors in the request.
 *       '403':
 *         description: Forbidden. Unauthorized access.
 *       '404':
 *         description: Not Found. Error during tournament creation.
 *       '500':
 *         description: Internal server error.
 */

/**
 * @function POST /api/tournaments
 * @description Create a new Tournament.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
tournamentRouter.post("/", requiresAuthentication, //requiresAuthentication, to get the requesting Users ID
    body('name').custom(value => { console.log("name: ", value); return true }),
    body('description').custom(value => { console.log("description: ", value); return true }),
    body('public').custom(value => { console.log("public: ", value); return true }),
    body('startDate').custom(value => { console.log("startDate: ", value); return true }),
    body('tags').custom(value => { console.log("tags: ", value); return true }),
    body('admins').custom(value => { console.log("admins: ", value); return true }),
    body('participants').custom(value => { console.log("participants: ", value); return true }),
    body('tournamentSystem').custom(value => { console.log("tournamentSystem: ", value); return true }),
    body('totalParticipants').custom(value => { console.log("totalParticipants: ", value); return true }),
    body('participantsPerMatch').custom(value => { console.log("participantsPerMatch: ", value); return true }),
    body('tournamentState').custom(value => { console.log("tournamentState: ", value); return true }),
    async (req: any, res: any, next: any) => {

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        try {
            //creation of the Resource for creation
            const tournamentResource = matchedData(req) as TournamentResource

            //Fail handling
            if (!req.body.name) { return res.status(404).send("Error TR01: No Name given for Tournament creation") }
            if (!req.body.totalParticipants) { return res.status(404).send("Error TR02: No Number of total Participants given for Tournament creation") }
            if (!req.body.participantsPerMatch) { return res.status(404).send("Error TR03: No Number of Participants per Match given for Tournament creation") }
            //Setting defaults, if nothing is given
            if (!req.body.description) { tournamentResource.description = "" }
            if (!req.body.public) { tournamentResource.public = true }
            if (!req.body.startDate) { tournamentResource.startDate = new Date() }
            if (!req.body.tags) { tournamentResource.tags = [] }
            if (!req.body.participants) { tournamentResource.participants = [] }
            if (!req.body.tournamentState) { tournamentResource.tournamentState = TOURNAMENTSTATE.signUpPhase }
            //Always setting defaults, because we override it after (requesting User is Admin, tournamentSystem is createKOPhase)
            tournamentResource.admins = []
            tournamentResource.tournamentSystem = []

            //While creation of the Tournament, the requesting user is added to the admins Array
            if (!req.userId) {
                return res.status(404).send("Error TR04: Could not get requesting Users ID through requiresAuthentication")
            } else {
                //Adding the Admin
                tournamentResource.admins.push(req.userId)
            }

            //while creation of the Tournament, the tournamentSystem is created and added to the Tournament
            try {
                let tournieSystem = await createKOPhase(tournamentResource.totalParticipants, tournamentResource.participantsPerMatch)
                if (!tournieSystem.id) {
                    return res.status(404).send("Error TR01: No ID for created TournamentSystem")
                }
                //Adding the TournamentSystem (/KOPhase)
                tournamentResource.tournamentSystem.push(tournieSystem.id.toString())
            } catch (err) {
                return res.status(404).send("Error TR01: Could not create TournamentSystem: " + err)
            }

            //creating the Tournament in the DB
            const createdTournamentResoure = await createTournament(tournamentResource)
            return res.status(201).send(createdTournamentResoure)
        } catch (err) {
            return res.status(404).send("Error TR01: 404 in tournament creation. Error: " + err)
            //deprecated?: next(err)
        }
    });

/**
 * @swagger
 * /api/tournaments/{id}:
 *   delete:
 *     tags: [Tournament]
 *     summary: Delete a Tournament by ID.
 *     description: Delete a tournament with the specified ID.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the tournament to delete.
 *         schema:
 *           type: string
 *           format: mongodb ObjectId
 *     responses:
 *       '204':
 *         description: Tournament deleted successfully.
 *       '400':
 *         description: Bad Request. Validation errors in the request.
 *       '403':
 *         description: Forbidden. Unauthorized access.
 *       '404':
 *         description: Not Found. Tournament not found.
 *       '500':
 *         description: Internal server error.
 */

/**
 * @function DELETE /api/tournaments/:id
 * @description Delete a Tournament by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
tournamentRouter.delete("/:id", requiresAuthentication, param("id").isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        try {
            const tournieID = req.params.id;
            const tournie = await Tournament.findOne({ _id: tournieID }).exec()
            //check, if Tournament exists
            if (!tournie) {
                return res.status(404).send("Error TR02: Tournament not found")
            }
            //check, if the requesting user is one of the admins of the Tournament
            let isAuthorized = false
            for (let one of tournie.admins) {
                if (req.userId !== undefined && one.id.toString === req.userId?.toString) {
                    isAuthorized = true
                }
            }
            if (!isAuthorized) {
                return res.status(403).send("Error TR03: Unauthorized access. Requesting User is probably not a Admin of this Tournament");
            }
            await deleteTournament(tournieID);
            res.sendStatus(204);
        } catch (err) {
            res.status(400);
            next(err);
        }
    });

/**
 * @swagger
 * /api/tournaments/{id}:
 *   put:
 *     summary: Join a Tournament by ID.
 *     tags: [Tournament]
 *     description: Join a tournament with the specified ID.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the tournament to join.
 *         schema:
 *           type: string
 *           format: mongodb ObjectId
 *     responses:
 *       '200':
 *         description: Joined the tournament successfully.
 *         content:
 *           application/json:
 *             example:
 *               id: 123
 *               name: Tournament Name
 *               description: Tournament Description
 *               startDate: 2024-01-21
 *               public: true
 *               tags: ["tag1", "tag2"]
 *               admins: ["adminUserID1", "adminUserID2"]
 *               participants: ["participantUserID1", "participantUserID2", "joiningUserID"]
 *               tournamentSystem: ["tournamentSystemID"]
 *               totalParticipants: 16
 *               participantsPerMatch: 4
 *               tournamentState: "signUpPhase"
 *       '400':
 *         description: Bad Request. Validation errors in the request.
 *       '403':
 *         description: Forbidden. Unauthorized access.
 *       '404':
 *         description: Not Found. Tournament not found.
 *       '500':
 *         description: Internal server error.
 */

/**
 * @function PUT /api/tournaments/:id
 * @description Join a Tournament by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
tournamentRouter.put("/:id", requiresAuthentication, param("id").isMongoId(),
    async (req, res, next) => {
        //error handling
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.userId;
        if (req.userId === undefined) {
            return res.status(400).send("Error TR04: No UserID found");
        }
        // updating the Tournament / adding requesting User to participants array
        try {
            let updatedTournie = await addParticipant(req.params.id, req.userId)
            res.send(updatedTournie);
        } catch (err) {
            res.status(400);
            next(err);
        }
    });

/**
 * @swagger
 * /api/tournaments/complete/{id}:
 *   get:
 *     summary: Get complete Tournament resource by ID.
 *     tags: [Tournament]
 *     description: Retrieve complete information about a tournament with the specified ID.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the tournament to retrieve complete information.
 *         schema:
 *           type: string
 *           format: mongodb ObjectId
 *     responses:
 *       '200':
 *         description: A successful response with the complete tournament resource.
 *         content:
 *           application/json:
 *             example:
 *               id: 123
 *               name: Tournament Name
 *               description: Tournament Description
 *               startDate: 2024-01-21
 *               public: true
 *               tags: ["tag1", "tag2"]
 *               admins: ["adminUserID1", "adminUserID2"]
 *               participants: ["participantUserID1", "participantUserID2", "joiningUserID"]
 *               tournamentSystem: ["tournamentSystemID"]
 *               totalParticipants: 16
 *               participantsPerMatch: 4
 *               tournamentState: "signUpPhase"
 *       '400':
 *         description: Bad Request. Validation errors in the request.
 *       '403':
 *         description: Forbidden. Unauthorized access.
 *       '404':
 *         description: Not Found. Tournament not found.
 *       '500':
 *         description: Internal server error.
 */

/**
 * @function GET /api/tournaments/complete/:id
 * @description Get complete Tournament resource by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */tournamentRouter.get("/complete/:id", param("id").isMongoId(),
async (req, res, next) => {
    //error handling
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    if (!req.params) {
        return res.status(401).send("Error TR05: No params found");
    } else if (!req.params.id) {
        return res.status(402).send("Error TR06: No tournamentID found");
    }
    try {
        let completeResource = await getCompleteTournamentResourceByID(req.params.id)
        res.send(completeResource);
    }
    catch (err) {
        res.status(403).send("Error TR71: Error while finding Tournament: " + err);
        next(err);
    }
})

/**
 * @swagger
 * /api/tournaments/getAll:
 *   get:
 *     summary: Get all Tournaments.
 *     tags: [Tournament]
 *     description: Retrieve a list of all tournaments.
 *     responses:
 *       '200':
 *         description: A successful response with the list of tournaments.
 *         content:
 *           application/json:
 *             example:
 *               - id: 123
 *                 name: Tournament 1
 *               - id: 456
 *                 name: Tournament 2
 *       '400':
 *         description: Bad Request. Validation errors in the request.
 *       '404':
 *         description: Not Found. No tournaments available in the database.
 *       '500':
 *         description: Internal server error.
 */

/**
 * @function GET /api/tournaments/getAll
 * @description Get all Tournaments.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */tournamentRouter.get("/getAll",
    async (req, res, next) => {
        //error handling
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
        try {
            let foundTournie = await getTournaments()
            res.status(200).send(foundTournie);
        }
        catch (err) {
            res.status(400).send("Error TR72: Error while finding Tournaments: " + err);
            next(err);
        }
    })

/**
 * @swagger
 * /api/tournaments/{id}:
 *   get:
 *     summary: Get a Tournament by ID.
 *     tags: [Tournament]
 *     description: Retrieve information about a tournament with the specified ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the tournament to retrieve information.
 *         schema:
 *           type: string
 *           format: mongodb ObjectId
 *     responses:
 *       '200':
 *         description: A successful response with the tournament information.
 *         content:
 *           application/json:
 *             example:
 *               id: 123
 *               name: Tournament Name
 *               description: Tournament Description
 *               startDate: 2024-01-21
 *               public: true
 *               tags: ["tag1", "tag2"]
 *               admins: ["adminUserID1", "adminUserID2"]
 *               participants: ["participantUserID1", "participantUserID2"]
 *               tournamentSystem: ["tournamentSystemID"]
 *               totalParticipants: 16
 *               participantsPerMatch: 4
 *               tournamentState: "signUpPhase"
 *       '400':
 *         description: Bad Request. Validation errors in the request.
 *       '404':
 *         description: Not Found. Tournament not found.
 *       '500':
 *         description: Internal server error.
 */

/**
 * @function GET /api/tournaments/:id
 * @description Get a Tournament by ID.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */tournamentRouter.get("/:id", param("id").isMongoId(),
    async (req, res, next) => {
        //error handling
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        if (!req.params) {
            return res.status(401).send("Error TR05: No params found");
        } else if (!req.params.id) {
            return res.status(402).send("Error TR06: No tournamentID found");
        }
        try {
            let foundTournie = await getTournamentByID(req.params.id)
            res.send(foundTournie);
        }
        catch (err) {
            res.status(403).send("Error TR71: Error while finding Tournament: " + err);
            next(err);
        }
    })


export default tournamentRouter;