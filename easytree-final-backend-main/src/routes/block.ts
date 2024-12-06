import express from "express";
import { body, matchedData, param, validationResult } from "express-validator";
import { createBlock, deleteBlockByID, getBlockByID, updateBlock } from "../services/BlockService";
import { BlockResource } from "../Resources";
import { BLOCKSTATE } from "../Enum";


const blockRouter = express.Router();

/**
 * @swagger
 *   /api/block:
 *     post:
 *       summary: Create a new block
 *       tags: [Blocks]
 *       requestBody:
 *         description: Block data to create
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BlockResource'
 *       responses:
 *         '201':
 *           description: Created successfully
 *           content:
 *             application/json:
 *               example:
 *                 id: "12345"
 */
blockRouter.post("/",
    body('id').optional().isMongoId(),
    body('next').optional().isMongoId(),
    body('depth').optional().isInt({ min: 0, max: 10 }),
    body('participant').optional().isMongoId(),
    body('score').optional().isInt({ min: 0 }),
    body('blockState').optional().custom(value => {
        if (Object.values(BLOCKSTATE).includes(value)) {
            return true
        }
        else {
            throw new Error("blockState is not valid")
        }
    }),
    body('name').optional().isString(),
    async (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            })
        }
        let blockResource: BlockResource
        try {
            blockResource = matchedData(req) as BlockResource
            const block = await createBlock(blockResource)
            res.status(201).send(block)
        }
        catch (err) {
            const error: Error = err as Error
            if (error.message.startsWith("2000")) {
                return res.status(400).json({
                    errors: [
                        {
                            location: "body",
                            msg: error.message,
                            path: "id",
                            value: blockResource!.id
                        }
                    ]
                })
            }
            else if (error.message.startsWith("2001")) {
                return res.status(400).json({
                    errors: [
                        {
                            location: "body",
                            msg: error.message,
                            path: "next",
                            value: blockResource!.next
                        }
                    ]
                })
            }
            else if (error.message.startsWith("2002")) {
                return res.status(400).json({
                    errors: [
                        {
                            location: "body",
                            msg: error.message,
                            path: "participant",
                            value: blockResource!.participant
                        }
                    ]
                })
            }
            next(err)
        }
    });

    /**
 * @swagger
 *   /api/block/{id}:
 *     put:
 *       summary: Update a block by ID
 *       tags: [Blocks]
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           description: ID of the block to update
 *       requestBody:
 *         description: Block data to update
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BlockResource'
 *       responses:
 *         '200':
 *           description: Updated successfully
 *           content:
 *             application/json:
 *               example:
 *                 id: "12345"
 *         '400':
 *           description: Bad request
 *           content:
 *             application/json:
 *               example:
 *                 errors: [{ location: "body", msg: "Validation error", path: "id", value: "Invalid ID" }]
 *         '404':
 *           description: Block not found
 *           content:
 *             application/json:
 *               example:
 *                 errors: [{ location: "params", msg: "Block not found", path: "id", value: "Invalid ID" }]
 */


blockRouter.put("/:id",
    param('id').isMongoId(),
    body('id').optional().isMongoId(),
    body('next').optional().isMongoId(),
    body('depth').optional().isInt({ min: 0, max: 10 }),
    body('participant').optional().isMongoId(),
    body('score').optional().isInt({ min: 0 }),
    body('blockState').optional().custom(value => {
        if (Object.values(BLOCKSTATE).includes(value)) {
            return true
        }
        else {
            throw new Error("blockState is not valid")
        }
    }),
    body('name').optional().isString(),
    async (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            })
        }
        let blockResource: BlockResource
        try {
            blockResource = matchedData(req) as BlockResource
            if(blockResource.id){
                if(blockResource.id != req.params!.id ){
                    return res.status(400).json({
                        errors: [
                            {
                                location: "params",
                                msg: "ID Inconsistency",
                                path: "id",
                                value: req.params!.id
                            },
                            {
                                location: "body",
                                msg: "ID Inconsistency",
                                path: "id",
                                value: blockResource.id
                            }
                        ]
                    })
                }
            }
            blockResource.id = req.params!.id
            const block = await updateBlock(blockResource)
            res.status(200).send(block)
        }
        catch (err) {
            const error: Error = err as Error
            if (error.message.startsWith("2003")) {
                return res.status(400).json({
                    errors: [
                        {
                            location: "body",
                            msg: error.message,
                            path: "next",
                            value: blockResource!.next
                        }
                    ]
                })
            }
            else if (error.message.startsWith("2004")) {
                return res.status(400).json({
                    errors: [
                        {
                            location: "body",
                            msg: error.message,
                            path: "participant",
                            value: blockResource!.participant
                        }
                    ]
                })
            }
            else if (error.message.startsWith("2005")) { //sollte eigentlich nicht eintreten
                return res.status(403).json({
                    errors: [
                        {
                            location: "body",
                            msg: error.message,
                            path: "mongodb",
                            value: error.message
                        }
                    ]
                })
            }
            else if (error.message.startsWith("2006")) {
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

/**
 * @swagger
 *   /api/block/{id}:
 *     get:
 *       summary: Get a block by ID
 *       tags: [Blocks]
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           description: ID of the block to retrieve
 *       responses:
 *         '200':
 *           description: Block found
 *           content:
 *             application/json:
 *               example:
 *                 id: "12345"
 *         '400':
 *           description: Bad request
 *           content:
 *             application/json:
 *               example:
 *                 errors: [{ location: "params", msg: "Validation error", path: "id", value: "Invalid ID" }]
 *         '404':
 *           description: Block not found
 *           content:
 *             application/json:
 *               example:
 *                 errors: [{ location: "params", msg: "Block not found", path: "id", value: "Invalid ID" }]
 */


blockRouter.get("/:id",
    param('id').isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            })
        }
        try {
            const block = await getBlockByID(req.params!.id)
            res.status(200).send(block)
        }
        catch (err) {
            const error: Error = err as Error
            if (error.message.startsWith("2009")) {
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


/**
 * @swagger
 *   /api/block/{id}:
 *     delete:
 *       summary: Delete a block by ID
 *       tags: [Blocks]
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           description: ID of the block to delete
 *       responses:
 *         '204':
 *           description: Deleted successfully
 *         '400':
 *           description: Bad request
 *           content:
 *             application/json:
 *               example:
 *                 errors: [{ location: "params", msg: "Validation error", path: "id", value: "Invalid ID" }]
 *         '404':
 *           description: Block not found
 *           content:
 *             application/json:
 *               example:
 *                 errors: [{ location: "params", msg: "Block not found", path: "id", value: "Invalid ID" }]
 */


blockRouter.delete("/:id",
    param('id').isMongoId(),
    async (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            })
        }
        try {
            const block = await deleteBlockByID(req.params!.id)
            res.status(204).send(block)
        }
        catch (err) {
            const error: Error = err as Error
            if (error.message.startsWith("2009")) {
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

export default blockRouter;