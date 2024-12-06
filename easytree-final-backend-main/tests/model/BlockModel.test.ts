import { Types } from "mongoose";
import { IBlock, Block } from "../../src/model/BlockModel";
import { IUser, User } from "../../src/model/UserModel";
import { BLOCKSTATE } from "../../src/Enum";
import DB from "../DB";

let john: IUser & { _id: Types.ObjectId }

let block: IBlock & { _id: Types.ObjectId }

beforeAll(async () => await DB.connect())
beforeEach(async () => {
    john = await User.create({
        email: "john@doe.com",
        name: "John",
        password: "1234",
        admin: false
    })
})
afterEach(async () => await DB.clear())
afterAll(async () => await DB.close())

test("Block empty data defaults", async () => {
    block = await Block.create({})
    const blocks = await Block.find().exec()
    const res = blocks[0]
    expect(res).toBeDefined()
    expect(res.next).toBeUndefined()
    expect(res.depth).toBe(0)
    expect(res.participant).toBeUndefined()
    expect(res.score).toEqual(0)
    expect(res.blockState).toBe(BLOCKSTATE.scheduled)
    expect(res.name).toBeUndefined()
})

test("Block filled data", async () => {
    let block2: IBlock & { _id: Types.ObjectId }
    block2 = await Block.create({})
    
    block = await Block.create({
        next: block2._id.toString(),
        depth: 2,
        participant: john._id.toString(),
        score: 1,
        blockState: BLOCKSTATE.completed,
        name: "John"
    })
    const blocks = await Block.find({participant: john._id}).exec()
    const res = blocks[0]
    expect(res).toBeDefined()
    expect(res.next?.toString()).toBe(block2._id.toString())
    expect(res.depth).toBe(2)
    expect(res.participant?.toString()).toBe(john._id.toString())
    expect(res.score).toEqual(1)
    expect(res.blockState).toBe(BLOCKSTATE.completed)
    expect(res.name).toBe("John")
})
