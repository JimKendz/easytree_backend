import express from "express";
import { getUsers } from "../services/UserService";
import { requiresAuthentication } from "./authentication";

const usersRouter = express.Router();

/**
 * @swagger
 * components:
 *  schemas:
 *  Users:
 *       type: Object
 *       required:
 *              - name
 *              - email
 *              - password
 *       properties:
 *           id:
 *                  type: string
 *                  description: The auto-generated id of Users.
 *           name:
 *                  type: string
 *                  description: Name of Users.
 *           email:
 *                  type: string
 *                  description: Email of Users.
  *          password:
 *                  type: string
 *                  description: Password of Users.
 */

/**
 * @swagger
 * /api/users:
 *  get:
 *      summary: Get a list of users.
 *      tags: [Users]
 *      description: Retrieve a list of users from the database.
 *      responses:
 *          200:
 *              description: A successful response with the list of users.
 *          401:
 *              description: Unauthorized. Authentication is required.
 *          500:
 *              description: Internal server error.
 */

usersRouter.get("/", requiresAuthentication, async (_, res) => {
    const users = await getUsers();
    res.send(users); // 200 by default
})

export default usersRouter;
