import { Types } from "mongoose";
import { Tournament } from "../../src/model/TournamentModel";
import { IUser, User } from "../../src/model/UserModel";
import DB from "../DB";
import { TOURNAMENTSTATE } from "../../src/Enum";
import { TournamentResource } from "../../src/Resources";
import { IKOPhase, KOPhase } from "../../src/model/KOPhaseModel";
import { Block, IBlock } from "../../src/model/BlockModel";
import { addAdmin, addParticipant, createTournament, deleteTournament, getCompleteTournamentResourceByID, getTournamentByID, getTournaments, getTournamentsWhereUserIsAdmin, updateTournament } from "../../src/services/TournamentService";

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

test("getTournamentByID with partial Data", async () => {
    const tournament = await Tournament.create(partialData)
    const res = await getTournamentByID(tournament.id)
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

test("getTournamentByID with all data", async () => {
    const tournament = await Tournament.create(bierballData)
    const res = await getTournamentByID(tournament.id)
    expect(res).toBeDefined()
    expect(res.id).toBeDefined()
    expect(res.name).toBe("Bierball")
    expect(res.description).toBe("Saufen, morgens mittags abends")
    expect(res.public).toBe(false)
    expect(res.tags).toStrictEqual(["Bier", "Alkohol", "Sonne"])
    expect(res.admins).toStrictEqual([john1._id.toString(), john2._id.toString()])
    expect(res.participants).toStrictEqual([john1._id.toString(), john2._id.toString(), john3._id.toString(), john4._id.toString()])
    expect(res.tournamentSystem).toStrictEqual([kophase._id.toString()])
    expect(res.totalParticipants).toBe(4)
    expect(res.participantsPerMatch).toBe(2)
    expect(res.tournamentState).toBe(TOURNAMENTSTATE.drawPhase)
    expect(res.startDate).toStrictEqual(new Date("2023-12-24"))
})

test("getTournaments with 2 Tournaments", async () => {
    const partial = await Tournament.create({
        name: "Important",
        totalParticipants: 8,
        participantsPerMatch: 2
    })
    const partial2 = await Tournament.create({
        name: "Important2",
        totalParticipants: 8,
        participantsPerMatch: 2
    })
    await Tournament.create(bierballData) // not public so should be 1
    const res = await getTournaments()
    expect(res).toBeDefined()
    expect(res.tournaments.length).toBe(2)
    expect(res.tournaments[0].name).toBe("Important")
    expect(res.tournaments[1].name).toBe("Important2")
})

test("getTournamentsOfUser", async () => {
    const partial = await Tournament.create({
        name: "Bierball",
        admins: [john1._id.toString()],
        participants: [],
        totalParticipants: 4,
        participantsPerMatch: 2,
    })
    const partial2 = await Tournament.create({
        name: "Bierball",
        admins: [],
        participants: [john1._id.toString()],
        totalParticipants: 4,
        participantsPerMatch: 2,
    })
    const partial3 = await Tournament.create({
        name: "Bierball",
        admins: [],
        participants: [john2._id.toString()],
        totalParticipants: 4,
        participantsPerMatch: 2,
    })
    await Tournament.create(bierballData) // not public so should be 1
    const res = await getTournamentsWhereUserIsAdmin(john1._id.toString())
    expect(res).toBeDefined()
    expect(res.tournaments.length).toBe(2)
    const res2 = await getTournamentsWhereUserIsAdmin(john2._id.toString())
    expect(res2).toBeDefined()
    expect(res2.tournaments.length).toBe(1)
})

test("createTournament with partial Data", async () => {
    const res = await createTournament(partialData)
    expect(res).toBeDefined()
    expect(res.id).toBeDefined()
    expect(res.name).toBe("Important")
    expect(res.description).toBe("")
    expect(res.public).toBe(true)
    expect(res.tags).toStrictEqual([])
    expect(res.admins).toStrictEqual([])
    expect(res.participants).toStrictEqual([])
    expect(res.tournamentSystem).not.toStrictEqual([])
    expect(res.totalParticipants).toBe(8)
    expect(res.participantsPerMatch).toBe(2)
    expect(res.tournamentState).toBe(TOURNAMENTSTATE.signUpPhase)
    expect(res.startDate).toBe(undefined)
})

test("createTournament with bierball Data", async () => {
    const res = await createTournament(bierballData)
    expect(res).toBeDefined()
    expect(res.id).toBeDefined()
    expect(res.name).toBe("Bierball")
    expect(res.description).toBe("Saufen, morgens mittags abends")
    expect(res.public).toBe(false)
    expect(res.tags).toStrictEqual(["Bier", "Alkohol", "Sonne"])
    expect(res.admins).toStrictEqual([john1._id.toString(), john2._id.toString()])
    expect(res.participants).toStrictEqual([john1._id.toString(), john2._id.toString(), john3._id.toString(), john4._id.toString()])
    expect(res.tournamentSystem).not.toStrictEqual([kophase._id.toString()])
    expect(res.totalParticipants).toBe(4)
    expect(res.participantsPerMatch).toBe(2)
    expect(res.tournamentState).toBe(TOURNAMENTSTATE.drawPhase)
    expect(res.startDate).toStrictEqual(new Date("2023-12-24"))

    const res2 = await Tournament.findById(res.id!)
    expect(res2!).toBeDefined()
    expect(res2!.id).toBeDefined()
    expect(res2!.name).toBe("Bierball")
    expect(res2!.description).toBe("Saufen, morgens mittags abends")
    expect(res2!.public).toBe(false)
    expect(res2!.tags).toStrictEqual(["Bier", "Alkohol", "Sonne"])
    expect(res2!.admins).toStrictEqual([john1._id, john2._id])
    expect(res2!.participants).toStrictEqual([john1._id, john2._id, john3._id, john4._id])
    expect(res2!.tournamentSystem).not.toStrictEqual([kophase._id])
    expect(res2!.totalParticipants).toBe(4)
    expect(res2!.participantsPerMatch).toBe(2)
    expect(res2!.tournamentState).toBe(TOURNAMENTSTATE.drawPhase)
    expect(res2!.startDate).toStrictEqual(new Date("2023-12-24"))
})

test("updateTournament with partial Data", async () => {
    const tournament = await createTournament(bierballData)
    const res = await updateTournament({
        id: tournament.id,
        name: "Important",
        totalParticipants: 8,
        participantsPerMatch: 2,
        description: "neue description"
    })
    expect(res).toBeDefined()
    expect(res.id).toBeDefined()
    expect(res.name).toBe("Bierball")
    expect(res.description).toBe("neue description")
    expect(res.public).toBe(false)
    expect(res.tags).toStrictEqual(["Bier", "Alkohol", "Sonne"])
    expect(res.admins).toStrictEqual([john1._id.toString(), john2._id.toString()])
    expect(res.participants).toStrictEqual([john1._id.toString(), john2._id.toString(), john3._id.toString(), john4._id.toString()])
    expect(res.tournamentSystem).not.toStrictEqual([kophase._id.toString()])
    expect(res.totalParticipants).toBe(4)
    expect(res.participantsPerMatch).toBe(2)
    expect(res.tournamentState).toBe(TOURNAMENTSTATE.drawPhase)
    expect(res.startDate).toStrictEqual(new Date("2023-12-24"))
})

test("updateTournament with partial wrong Data", async () => {
    const tournament = await createTournament(bierballData)
    const res = await updateTournament({
        id: tournament.id,
        name: "Important12315251",
        totalParticipants: 10,
        participantsPerMatch: 3,
        description: "neue description"
    })
    expect(res).toBeDefined()
    expect(res.id).toBeDefined()
    expect(res.name).toBe("Bierball")
    expect(res.description).toBe("neue description")
    expect(res.public).toBe(false)
    expect(res.tags).toStrictEqual(["Bier", "Alkohol", "Sonne"])
    expect(res.admins).toStrictEqual([john1._id.toString(), john2._id.toString()])
    expect(res.participants).toStrictEqual([john1._id.toString(), john2._id.toString(), john3._id.toString(), john4._id.toString()])
    expect(res.tournamentSystem).not.toStrictEqual([kophase._id.toString()])
    expect(res.totalParticipants).toBe(4)
    expect(res.participantsPerMatch).toBe(2)
    expect(res.tournamentState).toBe(TOURNAMENTSTATE.drawPhase)
    expect(res.startDate).toStrictEqual(new Date("2023-12-24"))
})

test("updateTournament with complete Data", async () => {
    const tournament = await createTournament(bierballData)
    const res = await updateTournament({
        id: tournament.id,
        name: "Bierball",
        description: "Saufen, morgens mittags abends1",
        public: true,
        tags: ["Bier1", "Alkohol", "Sonne"],
        admins: [john1._id.toString(), john2._id.toString()],
        participants: [john1._id.toString(), john2._id.toString(), john3._id.toString(), john4._id.toString()],
        tournamentSystem: [kophase._id.toString()],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.completed,
        startDate: new Date("2023-12-25")
    })
    expect(res).toBeDefined()
    expect(res.id).toBeDefined()
    expect(res.name).toBe("Bierball")
    expect(res.description).toBe("Saufen, morgens mittags abends1")
    expect(res.public).toBe(true)
    expect(res.tags).toStrictEqual(["Bier1", "Alkohol", "Sonne"])
    expect(res.admins).toStrictEqual([john1._id.toString(), john2._id.toString()])
    expect(res.participants).toStrictEqual([john1._id.toString(), john2._id.toString(), john3._id.toString(), john4._id.toString()])
    expect(res.tournamentSystem).not.toStrictEqual([kophase._id.toString()])
    expect(res.totalParticipants).toBe(4)
    expect(res.participantsPerMatch).toBe(2)
    expect(res.tournamentState).toBe(TOURNAMENTSTATE.completed)
    expect(res.startDate).toStrictEqual(new Date("2023-12-25"))
})

test("addAdmin", async () => {
    const tournament = await createTournament(partialData)
    if (tournament.id) {
        const res = await addAdmin(tournament.id, john1._id.toString())
        expect(res.admins).toStrictEqual([john1._id.toString()])
        await expect(addAdmin(tournament.id, john1._id.toString())).rejects.toThrow()
    }
})

test("addAdmin - no admin with Id found", async () => {
    const tournament = await createTournament(partialData)
    if (tournament.id) {
        const newAdmin = new Types.ObjectId().toString()
        await expect(addAdmin(tournament.id, newAdmin))
        .rejects.toThrow(`Error TS83: No Admin with ID ${newAdmin} found`)
    }
})

test("addParticipants", async () => {
    const tournament = await createTournament(partialData)
    if (tournament.id) {
        const res = await addParticipant(tournament.id, john1._id.toString())
        expect(res.participants).toStrictEqual([john1._id.toString()])
        await expect(addParticipant(tournament.id, john1._id.toString())).rejects.toThrow()
    }
})

test("deleteTournament", async () => {
    const tournament = await createTournament(partialData)
    if (tournament.id) {
        await deleteTournament(tournament.id)
        await expect(getTournamentByID(tournament.id)).rejects.toThrow()
    }
    const tournament2 = await createTournament(bierballData)
    if (tournament2.id) {
        await expect(getTournamentByID(tournament2.id)).resolves
        await expect(deleteTournament(tournament2.id)).rejects.toThrow()
    }
})

test("getCompleteTournamentResourceByID", async () => {
    const res = await createTournament(bierballData)
    expect(res).toBeDefined()
    expect(res.id).toBeDefined()
    expect(res.name).toBe("Bierball")
    expect(res.description).toBe("Saufen, morgens mittags abends")
    expect(res.public).toBe(false)
    expect(res.tags).toStrictEqual(["Bier", "Alkohol", "Sonne"])
    expect(res.admins).toStrictEqual([john1._id.toString(), john2._id.toString()])
    expect(res.participants).toStrictEqual([john1._id.toString(), john2._id.toString(), john3._id.toString(), john4._id.toString()])
    expect(res.tournamentSystem).not.toStrictEqual([kophase._id.toString()])
    expect(res.totalParticipants).toBe(4)
    expect(res.participantsPerMatch).toBe(2)
    expect(res.tournamentState).toBe(TOURNAMENTSTATE.drawPhase)
    expect(res.startDate).toStrictEqual(new Date("2023-12-24"))
    const res2 = await getCompleteTournamentResourceByID(res.id!)
    expect(res2).toBeDefined()
    //tournament part
    expect(res2.tournament.id).toBe(res.id)
    expect(res2.tournament.totalParticipants).toBe(4)
    expect(res2.tournament.participantsPerMatch).toBe(2)
    //participants part
    expect(res2.participants.users.length).toBe(4)
    //kophase part
    expect(res2.kophase.blocks.length).toBe(7)
    //blocks part
    expect(res2.blocks.blocks.length).toBe(7)

    const res3 = await createTournament(partialData)
    expect(res3).toBeDefined()
    expect(res3.id).toBeDefined()
    expect(res3.name).toBe("Important")
    expect(res3.description).toBe("")
    expect(res3.public).toBe(true)
    expect(res3.tags).toStrictEqual([])
    expect(res3.admins).toStrictEqual([])
    expect(res3.participants).toStrictEqual([])
    expect(res3.tournamentSystem).not.toStrictEqual([])
    expect(res3.totalParticipants).toBe(8)
    expect(res3.participantsPerMatch).toBe(2)
    expect(res3.tournamentState).toBe(TOURNAMENTSTATE.signUpPhase)
    expect(res3.startDate).toBe(undefined)
    const res4 = await getCompleteTournamentResourceByID(res3.id!)
    expect(res4).toBeDefined()
    //tournament part
    expect(res4.tournament.id).toBe(res3.id)
    expect(res4.tournament.totalParticipants).toBe(8)
    expect(res4.tournament.participantsPerMatch).toBe(2)
    //participants part
    expect(res4.participants.users.length).toBe(0)
    //kophase part
    expect(res4.kophase.blocks.length).toBe(15)
    //blocks part
    expect(res4.blocks.blocks.length).toBe(15)
})