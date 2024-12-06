import { Types } from "mongoose";
import { ITournament, Tournament } from "../../src/model/TournamentModel";
import { IUser, User } from "../../src/model/UserModel";
import DB from "../DB";
import { TOURNAMENTSTATE } from "../../src/Enum";
import { TournamentResource } from "../../src/Resources";
import { IKOPhase, KOPhase } from "../../src/model/KOPhaseModel";
import { Block, IBlock } from "../../src/model/BlockModel";
import exp from "constants";

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

test("Tournament with all data", async () => {
    const res = await Tournament.create(bierballData)
    expect(res).toBeDefined()
    expect(res.id).toBeDefined()
    expect(res.name).toBe("Bierball")
    expect(res.description).toBe("Saufen, morgens mittags abends")
    expect(res.public).toBe(false)
    expect(res.tags).toStrictEqual(["Bier", "Alkohol", "Sonne"])
    expect(res.admins).toStrictEqual([john1._id, john2._id])
    expect(res.participants).toStrictEqual([john1._id, john2._id, john3._id, john4._id])
    expect(res.tournamentSystem).toStrictEqual([kophase._id])
    expect(res.totalParticipants).toBe(4)
    expect(res.participantsPerMatch).toBe(2)
    expect(res.tournamentState).toBe(TOURNAMENTSTATE.drawPhase)
    expect(res.startDate).toStrictEqual(new Date("2023-12-24"))
})

test("Tournament with partial data", async () => {
    const res = await Tournament.create(partialData)
    expect(res).toBeDefined()
    expect(res.id).toBeDefined()
    expect(res.name).toBe("Important")
    expect(res.description).toBe("")
    expect(res.public).toBe(true)
    expect(res.tags).toStrictEqual([])
    expect(res.admins).toStrictEqual([])
    expect(res.participants).toStrictEqual([])
    expect(res.tournamentSystem).toStrictEqual([])
    expect(res.totalParticipants).toBe(8)
    expect(res.participantsPerMatch).toBe(2)
    expect(res.tournamentState).toBe(TOURNAMENTSTATE.signUpPhase)
    expect(res.startDate).toBe(undefined)
})

test("Tournament with too little data", async () => {
    //without name
    await expect(Tournament.create({
        totalParticipants: 8,
        participantsPerMatch: 2
    })).rejects.toThrow()
})


test("Check if user is an admin", async () => {
    const tournamentInstance = await Tournament.create(bierballData);

    const isAdmin1 = await (tournamentInstance as any).isAdmin(john1._id.toString());
    expect(isAdmin1).toBe(false);
});