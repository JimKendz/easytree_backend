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

test("get all Tournaments", async () => {
    const tournament1 = await Tournament.create(partialData)
    const tournament2 = await Tournament.create(bierballData)

    const request = supertest(app);

    const response = await request.get(`/api/tournaments`).send({})

    expect(response.statusCode).toBe(200);
})
