import { Types } from "mongoose";
import { IBlock } from "../../src/model/BlockModel";
import { IUser, User } from "../../src/model/UserModel";
import { BLOCKSTATE } from "../../src/Enum";
import DB from "../DB";
import { addScoreToBlock, compareScore, createBlock, deleteBlockByID, getBlockByID, updateBlock } from "../../src/services/BlockService";
import { BlockResource } from "../../src/Resources";
import { createUser } from "src/services/UserService";

let john: IUser & { _id: Types.ObjectId }

let jane: IUser & { _id: Types.ObjectId }

let block: IBlock & { _id: Types.ObjectId }

beforeAll(async () => await DB.connect())
beforeEach(async () => {
    john = await User.create({
        email: "john@doe.com",
        name: "John",
        password: "1234",
        admin: false
    })
    jane = await User.create({
        email: "jane@doe.com",
        name: "Jane",
        password: "1234",
        admin: false
    })
})
afterEach(async () => await DB.clear())
afterAll(async () => await DB.close())

test("createBlock without any data", async () => {
    const res = await createBlock({})
    expect(res).toBeDefined()
    expect(res.id).toBeDefined()
    expect(res.next).toBeUndefined()
    expect(res.depth).toBe(0)
    expect(res.participant).toBeUndefined()
    expect(res.score).toEqual(0)
    expect(res.blockState).toBe(BLOCKSTATE.scheduled)
})

test("createBlock with data", async () => {
    const dummy = await createBlock({})
    const blockResource: BlockResource = {
        next: dummy.id,
        depth: 2,
        participant: john._id.toString(),
        score: 1,
        blockState: BLOCKSTATE.completed
    }
    const res = await createBlock(blockResource)

    expect(res).toBeDefined()
    expect(res.id).toBeDefined()
    expect(res.next?.toString()).toBe(dummy.id)
    expect(res.depth).toBe(2)
    expect(res.participant?.toString()).toBe(john._id.toString())
    expect(res.score).toEqual(1)
    expect(res.blockState).toBe(BLOCKSTATE.completed)
})

test("updateBlock without any data", async () => {
    const dummy = await createBlock({})
    const res = await updateBlock(dummy)
    expect(res).toBeDefined()
    expect(res.id).toBeDefined()
    expect(res.next).toBeUndefined()
    expect(res.depth).toBe(0)
    expect(res.participant).toBeUndefined()
    expect(res.score).toEqual(0)
    expect(res.blockState).toBe(BLOCKSTATE.scheduled)
})

test("updateBlock with data", async () => {
    const dummy = await createBlock({})
    const dummy2 = await createBlock({})
    const res = await updateBlock({
        id: dummy.id,
        next: dummy2.id,
        depth: 2,
        participant: john._id.toString(),
        score: 1,
        blockState: BLOCKSTATE.completed
    })
    expect(res).toBeDefined()
    expect(res.id).toBeDefined()
    expect(res.next?.toString()).toBe(dummy2.id)
    expect(res.depth).toBe(2)
    expect(res.participant?.toString()).toBe(john._id.toString())
    expect(res.score).toEqual(1)
    expect(res.blockState).toBe(BLOCKSTATE.completed)
})

test("getBlockByID without any data", async () => {
    const dummy = await createBlock({})
    const res = await getBlockByID(dummy.id!)
    expect(res).toBeDefined()
    expect(res.id).toBeDefined()
    expect(res.next).toBeUndefined()
    expect(res.depth).toBe(0)
    expect(res.participant).toBeUndefined()
    expect(res.score).toEqual(0)
    expect(res.blockState).toBe(BLOCKSTATE.scheduled)
})

test("getBlockByID with data", async () => {
    const dummy = await createBlock({})
    const blockResource: BlockResource = {
        next: dummy.id,
        depth: 2,
        participant: john._id.toString(),
        score: 1,
        blockState: BLOCKSTATE.completed
    }
    const dummy2 = await createBlock(blockResource)
    const res = await getBlockByID(dummy2.id!)
    expect(res).toBeDefined()
    expect(res.id).toBeDefined()
    expect(res.next?.toString()).toBe(dummy.id)
    expect(res.depth).toBe(2)
    expect(res.participant?.toString()).toBe(john._id.toString())
    expect(res.score).toEqual(1)
    expect(res.blockState).toBe(BLOCKSTATE.completed)
})

test("deleteBlockByID without any data", async () => {
    const dummy = await createBlock({})
    const res = await deleteBlockByID(dummy.id!)
    expect(res).toBeUndefined()
    await expect(getBlockByID(dummy.id!)).rejects.toThrow()
})

test("add score to block", async () => {
    const dummy = await createBlock({})
    expect(dummy.score).toEqual(0)
    await expect(addScoreToBlock(dummy.id!, 2)).rejects.toThrow()

    const dummy1 = await createBlock({
        blockState: BLOCKSTATE.onGoing
    })
    expect(dummy1.score).toEqual(0)
    const updatedBlock1 = await addScoreToBlock(dummy1.id!, 2);
    expect(updatedBlock1).toBeDefined();
    expect(updatedBlock1.score).toEqual(2);
})

test("compareScore", async () => {
    let nextBlock = await createBlock({});
    let nextBlockID = nextBlock.id!.toString();
    const johnBlock = await createBlock({});
    const janeBlock = await createBlock({});
    
    const matchBlocks: BlockResource[] = [
        { id: johnBlock.id!, next: nextBlockID, depth: 1, participant: john._id.toString(), score: 2, blockState: BLOCKSTATE.completed },
        { id: janeBlock.id!, next: nextBlockID, depth: 1, participant: jane._id.toString(), score: 1, blockState: BLOCKSTATE.completed },
    ];

    // setting up the match blocks with scores
    await Promise.all(matchBlocks.map(block => updateBlock(block)));

    // calling compareScore on one of the blocks
    nextBlock = await compareScore(janeBlock.id!);

    expect(nextBlock).toBeDefined();
    expect(nextBlock.participant?.toString()).toBe(john._id.toString());
    expect(nextBlock.score).toEqual(0);
});

test("createBlock with existing ID", async () => {
    const dummy = await createBlock({});
    const blockResource = {
        id: dummy.id!,
        next: "someId",
        depth: 2,
        participant: "someUserId",
        score: 1,
        blockState: BLOCKSTATE.completed,
    };

    await expect(createBlock(blockResource)).rejects.toThrow("2000 Block already exists");
});

test("createBlock with non-existent next block", async () => {
    const blockResource = {
        next: john._id.toString(),
        depth: 2,
        participant: john._id.toString(),
        score: 1,
        blockState: BLOCKSTATE.completed,
    };

    await expect(createBlock(blockResource)).rejects.toThrow("2001 Block(next) doesnt exist");
});

test("createBlock with non-existent participant", async () => {
    const dummy2 = await createBlock({})
    const blockResource = {
        next: dummy2.id!,
        depth: 2,
        participant: dummy2.id!,
        score: 1,
        blockState: BLOCKSTATE.completed,
    };

    await expect(createBlock(blockResource)).rejects.toThrow("2002 Participant doesnt exist");
});

test("deleteBlockByID - no block found to delete", async () => {
    const dummy = await createBlock({})
    const res = await deleteBlockByID(dummy.id!)

    await expect(deleteBlockByID(dummy.id!)).rejects.toThrow("2010 no Block found!");
});

test("addScoreToBlock - no block to add a score to", async () => {
    const dummy = await createBlock({})
    const res = await deleteBlockByID(dummy.id!)

    await expect(addScoreToBlock(dummy.id!, 2)).rejects.toThrow("2012 no Block found!");
});

test("updateBlock - no block update", async () => {
    const dummy = await createBlock({})
    const res = await deleteBlockByID(dummy.id!)

    await expect(updateBlock(dummy)).rejects.toThrow("2006 no Block found");
});

test("compareScore - no blocks to compare", async () => {
    const dummy = await createBlock({})
    const res = await deleteBlockByID(dummy.id!)

    await expect(compareScore(dummy.id!)).rejects.toThrow("2013 no Block found!");
});

test("compareScore - blocks aren't completed2", async () => {
    const block1 = await createBlock({});
    const block2 = await createBlock({});

    await deleteBlockByID(block1.id!);

    await expect(() => compareScore(block2.id!)).rejects.toThrow("2014 all blocks in the match must be completed before comparing scores");
});

test("updateBlock - Block(next) doesn't exist", async () => {
    const dummy = await createBlock({});
    const updatePromise = updateBlock({
        id: dummy.id!,
        next: john._id.toString()
    });

    await expect(updatePromise).rejects.toThrow("2003 Block(next) doesnt exist");
});

test("updateBlock - participant doesn't exist", async () => {
    const dummy = await createBlock({});
    const updatePromise = updateBlock({
        id: dummy.id!,
        participant: dummy.id!.toString(),
    });

    await expect(updatePromise).rejects.toThrow("2004 Participant doesnt exist");
});