import { Types } from "mongoose";
import { ITournament, Tournament } from "../../src/model/TournamentModel";
import { IUser, User } from "../../src/model/UserModel";
import DB from "../DB";
import { TOURNAMENTSTATE } from "../../src/Enum";
import { TournamentResource } from "../../src/Resources";
import { IKOPhase, KOPhase } from "../../src/model/KOPhaseModel";
import { Block, IBlock } from "../../src/model/BlockModel";
import { addAdmin, addParticipant, createTournament, deleteTournament, getTournamentByID, getTournaments, getTournamentsWhereUserIsAdmin, updateTournament } from "../../src/services/TournamentService";
import supertest from "supertest";
import app from "../../src/app";

let john1: IUser & { _id: Types.ObjectId }
let john2: IUser & { _id: Types.ObjectId }
let john3: IUser & { _id: Types.ObjectId }
let john4: IUser & { _id: Types.ObjectId }

let kophase: IKOPhase & { _id: Types.ObjectId }

let block1: IBlock & { _id: Types.ObjectId }
let block2: IBlock & { _id: Types.ObjectId }
let block3: IBlock & { _id: Types.ObjectId }

let bierballData: TournamentResource
let partialData: TournamentResource


beforeAll(async () => await DB.connect())
beforeEach(async () => {
    Block.syncIndexes()
    User.syncIndexes()
    KOPhase.syncIndexes()
    Tournament.syncIndexes()

    john1 = await User.create({
        email: "john1@doe.com",
        name: "John1",
        password: "1234",
        admin: false
    })

    john2 = await User.create({
        email: "john2@doe.com",
        name: "John2",
        password: "1234",
        admin: false
    })

    john3 = await User.create({
        email: "john3@doe.com",
        name: "John3",
        password: "1234",
        admin: false
    })

    john4 = await User.create({
        email: "john4@doe.com",
        name: "John4",
        password: "1234",
        admin: false
    })

    block1 = await Block.create({})
    block2 = await Block.create({})
    block3 = await Block.create({})

    kophase = await KOPhase.create({
        totalParticipants: 2,
        blocks: [block1._id, block2._id, block3._id]
    })

    bierballData = {
        name: "Bierball",
        description: "Saufen, morgens mittags abends",
        public: false,
        tags: ["Bier", "Alkohol", "Sonne"],
        admins: [john1._id.toString(), john2._id.toString()],
        participants: [john1._id.toString(), john2._id.toString(), john3._id.toString(), john4._id.toString()],
        tournamentSystem: [kophase._id.toString()],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.drawPhase,
        startDate: new Date("2023-12-24")
    }

    partialData = {
        name: "Important",
        totalParticipants: 8,
        participantsPerMatch: 2
    }
})
afterEach(async () => await DB.clear())
afterAll(async () => await DB.close())

test("get complete Resource of a Tournament", async () => {
    const tournament = await createTournament(bierballData)

    const request = supertest(app);

    //const response = await request.get(`/api/tournament/${tournament.id}`).send({})
    const res = await request.get(`/api/tournament/complete/${tournament.id}`).send({})

    expect(res.statusCode).toBe(200);
    //tournament part
    expect(res.body.tournament.id).toBe(tournament.id)
    expect(res.body.tournament.totalParticipants).toBe(tournament.totalParticipants)
    //participants part
    expect(res.body.participants.users.length).toBe(tournament.participants!.length)
    //kophase part
    expect(res.body.kophase.totalParticipants).toBe(tournament.totalParticipants)
    //blocks part
    expect(res.body.blocks.blocks.length).toBe(tournament.totalParticipants * tournament.participantsPerMatch -1)
})

test("add admin to tournament", async () => {
    const tournament = await createTournament(partialData);
    const newAdmin = await User.create({ name: "New Admin", email: "admin@example.com", password: "1234", admin: false });

    await addAdmin(tournament.id!.toString(), newAdmin.id);

    const updatedTournament = await getTournamentByID(tournament.id!.toString());

    expect(updatedTournament.admins).toContain(newAdmin.id.toString());
});

test("join tournament", async () => {
    const tournament = await createTournament(partialData);
    const newUser = await User.create({ name: "New User", email: "user@example.com", password: "1234", admin: false });

    await addParticipant(tournament.id!.toString(), newUser.id);

    const updatedTournament = await getTournamentByID(tournament.id!.toString());

    expect(updatedTournament.participants).toContain(newUser.id.toString());
});

test("delete tournament", async () => {
    const tournament = await createTournament(partialData);

    await deleteTournament(tournament.id!.toString());

    // Attempt to retrieve the deleted tournament
    const response = await supertest(app).get(`/api/tournament/${tournament.id}`).send({});
    
    expect(response.statusCode).toBe(403);
});

test("get non-existent tournament", async () => {
    const response = await supertest(app).get("/api/tournament/invalid-id").send({});
    
    expect(response.statusCode).toBe(400);
});

test("delete non-existent tournament", async () => {
    const response = await supertest(app).delete("/api/tournament/invalid-id").send({});
    
    expect(response.statusCode).toBe(401);
});

test("join non-existent tournament", async () => {
    const response = await supertest(app).put("/api/tournament/invalid-id").send({});
    
    expect(response.statusCode).toBe(401);
});

test("update non-existent tournament", async () => {
    const response = await supertest(app).put("/api/tournament/invalid-id").send({});
    
    expect(response.statusCode).toBe(401);
});

test("get complete resource of non-existent tournament", async () => {
    const response = await supertest(app).get("/api/tournament/complete/invalid-id").send({});
    
    expect(response.statusCode).toBe(400);
});

test("get tournaments where user is admin with invalid ID", async () => {
    const response = await supertest(app).get("/api/tournament/getAll?adminId=invalid-id").send({});
    
    expect(response.statusCode).toBe(200);
});

test("update tournament with empty body", async () => {
    const tournament = await createTournament(partialData);
    const response = await supertest(app).put(`/api/tournament/${tournament.id}`).send({});
    
    expect(response.statusCode).toBe(401);
});

test("join tournament with empty body", async () => {
    const tournament = await createTournament(partialData);
    const response = await supertest(app).put(`/api/tournament/${tournament.id}`).send({});
    
    expect(response.statusCode).toBe(401);
});

test("create tournament with missing data", async () => {
    const response = await supertest(app).post("/api/tournament").send({});
    
    expect(response.statusCode).toBe(401);
});

test("create tournament with incorrect data types", async () => {
    const invalidData = {
        name: 123,
        totalParticipants: "invalid",
        participantsPerMatch: "invalid",
    };

    const response = await supertest(app).post("/api/tournament").send(invalidData);
    
    expect(response.statusCode).toBe(401);
});

test("create tournament with invalid admin ID", async () => {
    const invalidData = {
        name: "Invalid Tournament",
        totalParticipants: 8,
        participantsPerMatch: 2,
        admins: ["invalid-id"],
    };

    const response = await supertest(app).post("/api/tournament").send(invalidData);
    
    expect(response.statusCode).toBe(401);
});

test("create tournament with invalid tournament system ID", async () => {
    const invalidData = {
        name: "Invalid Tournament",
        totalParticipants: 8,
        participantsPerMatch: 2,
        tournamentSystem: ["invalid-id"],
    };

    const response = await supertest(app).post("/api/tournament").send(invalidData);
    
    expect(response.statusCode).toBe(401);
});

test("create tournament with unvalid data", async () => {
    const response = await supertest(app)
        .post("/api/tournament")
        .send({
            name: "unValid Tournament",
            totalParticipants: 8,
            participantsPerMatch: 2,
            admins: [john1._id.toString()],
            tournamentSystem: [kophase._id!.toString()],
        });

    expect(response.statusCode).toBe(401);
});

test("update tournament with unvalid data", async () => {
    const tournament = await createTournament(partialData);
    const response = await supertest(app)
        .put(`/api/tournament/${tournament.id}`)
        .send({
            name: "Updated Tournament",
            totalParticipants: 10,
            participantsPerMatch: 3,
            admins: [john1._id.toString(), john2._id.toString()],
            tournamentSystem: [kophase._id.toString()],
        });

    expect(response.statusCode).toBe(401);
});

test("get tournaments where user is admin", async () => {
    const response = await supertest(app)
        .get(`/api/tournament/getAll?adminId=${john1._id}`)
        .send({});

    expect(response.statusCode).toBe(200);
});

test("create tournament with missing data", async () => {
    const response = await supertest(app)
        .post("/api/tournament")
        .send({});
    
    expect(response.statusCode).toBe(401);
});

test("create tournament with incorrect data types", async () => {
    const invalidData = {
        name: 123,
        totalParticipants: "invalid",
        participantsPerMatch: "invalid",
    };

    const response = await supertest(app)
        .post("/api/tournament")
        .send(invalidData);
    
    expect(response.statusCode).toBe(401);
});

test("create tournament with invalid admin ID", async () => {
    const invalidData = {
        name: "Invalid Tournament",
        totalParticipants: 8,
        participantsPerMatch: 2,
        admins: ["invalid-id"],
    };

    const response = await supertest(app)
        .post("/api/tournament")
        .send(invalidData);
    
    expect(response.statusCode).toBe(401);
});

test("create tournament with invalid tournament system ID", async () => {
    const invalidData = {
        name: "Invalid Tournament",
        totalParticipants: 8,
        participantsPerMatch: 2,
        tournamentSystem: ["invalid-id"],
    };

    const response = await supertest(app)
        .post("/api/tournament")
        .send(invalidData);
    
    expect(response.statusCode).toBe(401);
});

test("delete non-existent tournament", async () => {
    const response = await supertest(app)
        .delete("/api/tournament/invalid-id")
        .send({});
    
    expect(response.statusCode).toBe(401);
});

test("join non-existent tournament", async () => {
    const response = await supertest(app)
        .put("/api/tournament/invalid-id")
        .send({});
    
    expect(response.statusCode).toBe(401);
});

test("update non-existent tournament", async () => {
    const response = await supertest(app)
        .put("/api/tournament/invalid-id")
        .send({});
    
    expect(response.statusCode).toBe(401);
});

//.

// Define the base URL for the API
const apiUrl = '/api/tournament';

test("create tournament with missing data", async () => {
    const response = await supertest(app)
        .post(apiUrl)
        .send({});
    
    expect(response.statusCode).toBe(401);
});

test("delete tournament with invalid ID", async () => {
    const invalidId = 'invalid-id';
    const response = await supertest(app)
        .delete(`${apiUrl}/${invalidId}`)
        .send({});
    
    expect(response.statusCode).toBe(401);
});

test("join tournament with invalid ID", async () => {
    const invalidId = 'invalid-id';
    const response = await supertest(app)
        .put(`${apiUrl}/${invalidId}`)
        .send({});
    
    expect(response.statusCode).toBe(401);
});

test("get complete resource of tournament with invalid ID", async () => {
    const invalidId = 'invalid-id';
    const response = await supertest(app)
        .get(`${apiUrl}/complete/${invalidId}`)
        .send({});
    
    expect(response.statusCode).toBe(400);
    expect(response.body.errors).toHaveLength(1); // Assuming 1 validation error
});

test("get tournament with invalid ID", async () => {
    const invalidId = 'invalid-id';
    const response = await supertest(app)
        .get(`${apiUrl}/${invalidId}`)
        .send({});
    
    expect(response.statusCode).toBe(400);
    expect(response.body.errors).toHaveLength(1); // Assuming 1 validation error
});

test("get tournaments with search text without authentication", async () => {
    const response = await supertest(app)
        .get(`${apiUrl}/getAll`)
        .send({});
    
    expect(response.statusCode).toBe(200);
});

test("get complete resource of tournament without ID", async () => {
    const response = await supertest(app)
        .get(`${apiUrl}/complete/`)
        .send({});
    
    expect(response.statusCode).toBe(400);
});

test("create tournament with missing totalParticipants", async () => {
    const invalidData = {
        name: "Invalid Tournament",
        participantsPerMatch: 2,
    };

    const response = await supertest(app)
        .post(apiUrl)
        .send(invalidData);
    
    expect(response.statusCode).toBe(401);
});

test("create tournament with missing participantsPerMatch", async () => {
    const invalidData = {
        name: "Invalid Tournament",
        totalParticipants: 8,
    };

    const response = await supertest(app)
        .post(apiUrl)
        .send(invalidData);
    
    expect(response.statusCode).toBe(401);
});

test("create tournament with invalid date format", async () => {
    const invalidData = {
        name: "Invalid Tournament",
        totalParticipants: 8,
        participantsPerMatch: 2,
        startDate: "invalid-date",
    };

    const response = await supertest(app)
        .post(apiUrl)
        .send(invalidData);
    
    expect(response.statusCode).toBe(401);
});

test("delete tournament with invalid ID format", async () => {
    const invalidId = 'invalid-id';
    const response = await supertest(app)
        .delete(`${apiUrl}/${invalidId}`)
        .send({});
    
    expect(response.statusCode).toBe(401);
});

test("join tournament with invalid ID format", async () => {
    const invalidId = 'invalid-id';
    const response = await supertest(app)
        .put(`${apiUrl}/${invalidId}`)
        .send({});
    
    expect(response.statusCode).toBe(401);
});

test("get complete resource of tournament with invalid ID format", async () => {
    const invalidId = 'invalid-id';
    const response = await supertest(app)
        .get(`${apiUrl}/complete/${invalidId}`)
        .send({});
    
    expect(response.statusCode).toBe(400);
    expect(response.body.errors).toHaveLength(1); // Assuming 1 validation error
});

test("get tournament with invalid ID format", async () => {
    const invalidId = 'invalid-id';
    const response = await supertest(app)
        .get(`${apiUrl}/${invalidId}`)
        .send({});
    
    expect(response.statusCode).toBe(400);
    expect(response.body.errors).toHaveLength(1); // Assuming 1 validation error
});

test("get tournaments with search text without authentication", async () => {
    const response = await supertest(app)
        .get(`${apiUrl}/getAll`)
        .send({});
    
    expect(response.statusCode).toBe(200);
});

test("get complete resource of tournament without ID", async () => {
    const response = await supertest(app)
        .get(`${apiUrl}/complete/`)
        .send({});
    
    expect(response.statusCode).toBe(400);
});

test("create tournament with invalid data types", async () => {
    const invalidData = {
        name: 123,
        totalParticipants: "invalid",
        participantsPerMatch: "invalid",
    };

    const response = await supertest(app)
        .post(apiUrl)
        .send(invalidData);
    
    expect(response.statusCode).toBe(401);
});

test("create tournament with invalid admin ID", async () => {
    const invalidData = {
        name: "Invalid Tournament",
        totalParticipants: 8,
        participantsPerMatch: 2,
        admins: ["invalid-id"],
    };

    const response = await supertest(app)
        .post(apiUrl)
        .send(invalidData);
    
    expect(response.statusCode).toBe(401);
});

test("create tournament with invalid tournament system ID", async () => {
    const invalidData = {
        name: "Invalid Tournament",
        totalParticipants: 8,
        participantsPerMatch: 2,
        tournamentSystem: ["invalid-id"],
    };

    const response = await supertest(app)
        .post(apiUrl)
        .send(invalidData);
    
    expect(response.statusCode).toBe(401);
});

test("join tournament with missing ID", async () => {
    const response = await supertest(app)
        .put(`${apiUrl}/`)
        .send({});
    
    expect(response.statusCode).toBe(404);
});

test("update tournament with invalid data types", async () => {
    const invalidData = {
        name: 123,
        totalParticipants: "invalid",
        participantsPerMatch: "invalid",
    };

    const response = await supertest(app)
        .put(`${apiUrl}/invalid-id`)
        .send(invalidData);
    
    expect(response.statusCode).toBe(401);
});

test("update non-existent tournament", async () => {
    const response = await supertest(app)
        .put(`${apiUrl}/invalid-id`)
        .send({});
    
    expect(response.statusCode).toBe(401); // Assuming 401 for non-existent tournament
});

test("delete non-existent tournament", async () => {
    const response = await supertest(app)
        .delete(`${apiUrl}/invalid-id`)
        .send({});
    
    expect(response.statusCode).toBe(401); // Assuming 401 for non-existent tournament
});

test("update tournament with empty body", async () => {
    const tournamentId = 'valid-id'; // Replace with an existing tournament ID
    const response = await supertest(app)
        .put(`${apiUrl}/${tournamentId}`)
        .send({});
    
    expect(response.statusCode).toBe(401); // Assuming 401 for empty body update
});

test("join tournament with empty body", async () => {
    const tournamentId = 'valid-id'; // Replace with an existing tournament ID
    const response = await supertest(app)
        .put(`${apiUrl}/${tournamentId}`)
        .send({});
    
    expect(response.statusCode).toBe(401); // Assuming 401 for empty body join
});

test("create tournament with missing data and incorrect data types", async () => {
    const response = await supertest(app)
        .post(apiUrl)
        .send({});
    
    expect(response.statusCode).toBe(401);
});

test("create tournament with invalid admin ID and tournament system ID", async () => {
    const invalidData = {
        name: "Invalid Tournament",
        totalParticipants: 8,
        participantsPerMatch: 2,
        admins: ["invalid-id"],
        tournamentSystem: ["invalid-id"],
    };

    const response = await supertest(app)
        .post(apiUrl)
        .send(invalidData);
    
    expect(response.statusCode).toBe(401);
});

test("get tournaments where user is admin with invalid ID", async () => {
    const response = await supertest(app)
        .get(`${apiUrl}/getAll?adminId=invalid-id`)
        .send({});
    
    expect(response.statusCode).toBe(200);
});

test("create tournament with unvalid data and missing admins", async () => {
    const response = await supertest(app)
        .post(apiUrl)
        .send({
            name: "Unvalid Tournament",
            totalParticipants: 8,
            participantsPerMatch: 2,
            tournamentSystem: ["invalid-id"],
        });

    expect(response.statusCode).toBe(401); // Assuming 401 for unvalid data and missing admins
});

test("update tournament with unvalid data and missing admins", async () => {
    const tournamentId = 'valid-id'; // Replace with an existing tournament ID
    const response = await supertest(app)
        .put(`${apiUrl}/${tournamentId}`)
        .send({
            name: "Updated Tournament",
            totalParticipants: 10,
            participantsPerMatch: 3,
            tournamentSystem: ["invalid-id"],
        });

    expect(response.statusCode).toBe(401); // Assuming 401 for unvalid data and missing admins
});

test("create tournament with incorrect data types and missing totalParticipants", async () => {
    const invalidData = {
        name: 123,
        participantsPerMatch: "invalid",
    };

    const response = await supertest(app)
        .post(apiUrl)
        .send(invalidData);

    expect(response.statusCode).toBe(401);
});

test("delete tournament with invalid ID format", async () => {
    const invalidId = 'invalid-id';
    const response = await supertest(app)
        .delete(`${apiUrl}/${invalidId}`)
        .send({});

    expect(response.statusCode).toBe(401);
});

test("join tournament with missing ID", async () => {
    const response = await supertest(app)
        .put(`${apiUrl}/`)
        .send({});

    expect(response.statusCode).toBe(404);
});

test("get complete resource of tournament without ID", async () => {
    const response = await supertest(app)
        .get(`${apiUrl}/complete/`)
        .send({});

    expect(response.statusCode).toBe(400);
});

test("get tournaments with search text without authentication", async () => {
    const response = await supertest(app)
        .get(`${apiUrl}/getAll`)
        .send({});

    expect(response.statusCode).toBe(200);
});






