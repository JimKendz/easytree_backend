import { Types } from "mongoose";
import { IBlock, Block } from "../../src/model/BlockModel";
import { IUser, User } from "../../src/model/UserModel";
import { BLOCKSTATE } from "../../src/Enum";
import app from "../../src/app"
import DB from "../DB";
import supertest from "supertest";
import { BlockResource } from "../../src/Resources";
import { createBlock } from "../../src/services/BlockService";
import exp from "constants";

let john: IUser & { _id: Types.ObjectId }

let block: IBlock & { _id: Types.ObjectId }

beforeAll(async () => await DB.connect())
beforeEach(async () => {
    Block.syncIndexes()
    User.syncIndexes()

    john = await User.create({
        email: "john@doe.com",
        name: "John",
        password: "1234",
        admin: false
    })

})
afterEach(async () => await DB.clear())
afterAll(async () => await DB.close())

test("block POST without data", async () => {
    const request = supertest(app)
    const block = await request.post(`/api/block`).send({})

    const status = block.statusCode
    expect(status).toBe(201)
    const body: BlockResource = block.body
    expect(body).toBeDefined()
    expect(body.next).toBeUndefined()
    expect(body.depth).toBe(0)
    expect(body.participant).toBeUndefined()
    expect(body.score).toEqual(0)
    expect(body.blockState).toBe(BLOCKSTATE.scheduled)
})

test("block POST with data", async () => {
    const request = supertest(app)
    const nextBlock = await createBlock({})
    const block = await request.post(`/api/block`).send({
        next: nextBlock.id,
        depth: 2,
        participant: john._id.toString(),
        score: 1,
        blockState: BLOCKSTATE.completed,
        name: john.name
    })

    const status = block.statusCode
    expect(status).toBe(201)
    const body: BlockResource = block.body
    expect(body).toBeDefined()
    expect(body.id).toBeDefined()
    expect(body.next?.toString()).toBe(nextBlock.id)
    expect(body.depth).toBe(2)
    expect(body.participant?.toString()).toBe(john._id.toString())
    expect(body.score).toEqual(1)
    expect(body.blockState).toBe(BLOCKSTATE.completed)
    expect(body.name).toBe(john.name)
})

test("block PUT without data", async () => {
    const request = supertest(app)
    const block = await createBlock({})

    const blockResource: BlockResource = {}

    const updatedBlock = await request.put(`/api/block/${block.id!}`).send(blockResource)

    const status = updatedBlock.statusCode
    expect(status).toBe(403)
})

test("block PUT only one variable", async () => {
    const request = supertest(app)
    const block = await createBlock({})

    const blockResource: BlockResource = {
        depth: 5
    }

    const updatedBlock = await request.put(`/api/block/${block.id!}`).send(blockResource)

    const status = updatedBlock.statusCode
    expect(status).toBe(200)
    const body: BlockResource = updatedBlock.body
    expect(body).toBeDefined()
    expect(body.next).toBeUndefined()
    expect(body.depth).toBe(5)
    expect(body.participant).toBeUndefined()
    expect(body.score).toEqual(0)
    expect(body.blockState).toBe(BLOCKSTATE.scheduled)
})

test("block PUT one variable (but no changes)", async () => {
    const request = supertest(app)
    const block = await createBlock({
        depth: 5
    })
    const blockResource: BlockResource = {
        depth: 5
    }
    const updatedBlock = await request.put(`/api/block/${block.id!}`).send(blockResource)

    const status = updatedBlock.statusCode
    expect(status).toBe(200)
    const body: BlockResource = updatedBlock.body
    expect(body).toBeDefined()
    expect(body.next).toBeUndefined()
    expect(body.depth).toBe(5)
    expect(body.participant).toBeUndefined()
    expect(body.score).toEqual(0)
    expect(body.blockState).toBe(BLOCKSTATE.scheduled)
})

test("block PUT with write data", async () => {
    const request = supertest(app)
    const block = await createBlock({})
    const nextBlock = await createBlock({})


    const blockResource: BlockResource = {
        id: block.id,
        depth: 3,
        next: nextBlock.id,
        participant: john._id.toString(),
        score: 12,
        blockState: BLOCKSTATE.completed,
        name: "jessie"
    }

    const updatedBlock = await request.put(`/api/block/${block.id!}`).send(blockResource)

    const status = updatedBlock.statusCode
    expect(status).toBe(200)
    const body: BlockResource = updatedBlock.body
    expect(body).toBeDefined()
    expect(body.id).toBe(block.id)
    expect(body.next).toBe(nextBlock.id)
    expect(body.depth).toBe(3)
    expect(body.participant).toBe(john._id.toString())
    expect(body.score).toEqual(12)
    expect(body.blockState).toBe(BLOCKSTATE.completed)
    expect(body.name).toBe("jessie")
})

test("block PUT with wrong data", async () => {
    const request = supertest(app)
    const block = await createBlock({})
    const block1 = await createBlock({})

    //id inconsistency
    const updatedBlock1 = await request.put(`/api/block/${block.id!}`).send({
        id: block1.id!,
        depth: 5
    })
    expect(updatedBlock1.statusCode).toBe(400)

    const updatedBlock2 = await request.put(`/api/block/${block.id!}`).send({
        depth: -1
    })
    expect(updatedBlock2.statusCode).toBe(400)

    const updatedBlock3 = await request.put(`/api/block/${block.id!}`).send({
        score: -1
    })
    expect(updatedBlock3.statusCode).toBe(400)

    const updatedBlock4 = await request.put(`/api/block/${block.id!}`).send({
        next: "asdfasdfjh12"
    })
    expect(updatedBlock4.statusCode).toBe(400)

    const updatedBlock5 = await request.put(`/api/block/${block.id!}`).send({
        participant: "asdfasdfjh12"
    })
    expect(updatedBlock5.statusCode).toBe(400)
})

test("block GET without data", async () => {
    const request = supertest(app)
    const block = await createBlock({})
    const newBlock = await request.get(`/api/block/${block.id}`).send({})

    const status = newBlock.statusCode
    expect(status).toBe(200)
    const body: BlockResource = newBlock.body
    expect(body).toBeDefined()
    expect(body.next).toBeUndefined()
    expect(body.depth).toBe(0)
    expect(body.participant).toBeUndefined()
    expect(body.score).toEqual(0)
    expect(body.blockState).toBe(BLOCKSTATE.scheduled)
})

test("block GET with data", async () => {
    const request = supertest(app)
    const nextBlock = await createBlock({})
    const block = await createBlock({
        next: nextBlock.id,
        depth: 2,
        participant: john._id.toString(),
        score: 1,
        blockState: BLOCKSTATE.completed,
        name: john.name
    })
    const newBlock = await request.get(`/api/block/${block.id}`).send({})

    const status = newBlock.statusCode
    expect(status).toBe(200)
    const body: BlockResource = newBlock.body
    expect(body).toBeDefined()
    expect(body.id).toBeDefined()
    expect(body.next?.toString()).toBe(nextBlock.id)
    expect(body.depth).toBe(2)
    expect(body.participant?.toString()).toBe(john._id.toString())
    expect(body.score).toEqual(1)
    expect(body.blockState).toBe(BLOCKSTATE.completed)
    expect(body.name).toBe(john.name)
})

test("block DELETE without data", async () => {
    const request = supertest(app)
    const block = await createBlock({})
    const deletedBlock = await request.delete(`/api/block/${block.id}`).send({})

    const status = deletedBlock.statusCode
    expect(status).toBe(204)
})

test("block DELETE with data", async () => {
    const request = supertest(app)
    const nextBlock = await createBlock({})
    const block = await createBlock({})
    const deletedBlock = await request.delete(`/api/block/${block.id}`).send({
        next: nextBlock.id,
        depth: 2,
        participant: john._id.toString(),
        score: 1,
        blockState: BLOCKSTATE.completed
    })

    const status = deletedBlock.statusCode
    expect(status).toBe(204)
})


