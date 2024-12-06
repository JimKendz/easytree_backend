import { Types } from "mongoose";
import { KOPhase } from "../../src/model/KOPhaseModel";
import { createKOPhase, getKOPhase, addUsersToKOPhase, deleteKOPhase, recursiveTree, addScoreForUser, nextDepth } from "../../src/services/KOPhaseService";
import DB from "../DB";
import { createBlock, getBlockByID } from "../../src/services/BlockService";
import { Block } from "../../src/model/BlockModel";
import { IUser, User } from "../../src/model/UserModel";
import { BLOCKRESULT, BLOCKSTATE } from "../../src/Enum";

let john1: IUser & { _id: Types.ObjectId }
let john2: IUser & { _id: Types.ObjectId }
let john3: IUser & { _id: Types.ObjectId }
let john4: IUser & { _id: Types.ObjectId }
let john5: IUser & { _id: Types.ObjectId }
let john6: IUser & { _id: Types.ObjectId }
let john7: IUser & { _id: Types.ObjectId }
let john8: IUser & { _id: Types.ObjectId }

let kophaseId: Types.ObjectId;

beforeAll(async () => await DB.connect());
beforeEach(async () => {
  User.syncIndexes()
  Block.syncIndexes()
  KOPhase.syncIndexes()
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
  john5 = await User.create({
    email: "john5@doe.com",
    name: "John5",
    password: "1234",
    admin: false
  })
  john6 = await User.create({
    email: "john6@doe.com",
    name: "John6",
    password: "1234",
    admin: false
  })
  john7 = await User.create({
    email: "john7@doe.com",
    name: "John7",
    password: "1234",
    admin: false
  })
  john8 = await User.create({
    email: "john8@doe.com",
    name: "John8",
    password: "1234",
    admin: false
  })
})
afterEach(async () => await DB.clear());
afterAll(async () => await DB.close());

test("createKOPHASE", async () => {
  const kophaseResource = await createKOPhase(8, 2);
  expect(kophaseResource.id).toBeDefined();
  expect(kophaseResource.totalParticipants).toBe(8);
  expect(kophaseResource.blocks).toHaveLength(15);
  expect(kophaseResource.currentDepth).toBe(3)

  const kophaseResource1 = await createKOPhase(16, 2);
  expect(kophaseResource1.id).toBeDefined();
  expect(kophaseResource1.totalParticipants).toBe(16);
  expect(kophaseResource1.blocks).toHaveLength(31);
  expect(kophaseResource1.currentDepth).toBe(4)

  const kophaseResource2 = await createKOPhase(2, 2);
  expect(kophaseResource2.id).toBeDefined();
  expect(kophaseResource2.totalParticipants).toBe(2);
  expect(kophaseResource2.blocks).toHaveLength(3);
  expect(kophaseResource2.currentDepth).toBe(1)

  expect(async () => {
    await createKOPhase(5, 2)
  }).rejects.toThrow

  const kophaseResource3 = await createKOPhase(9, 3);
  expect(kophaseResource3.id).toBeDefined();
  expect(kophaseResource3.totalParticipants).toBe(9);
  expect(kophaseResource3.blocks).toHaveLength(13);
  expect(kophaseResource3.currentDepth).toBe(2)

  const kophaseResource4 = await createKOPhase(3, 3);
  expect(kophaseResource4.id).toBeDefined();
  expect(kophaseResource4.totalParticipants).toBe(3);
  expect(kophaseResource4.blocks).toHaveLength(4);
  expect(kophaseResource4.currentDepth).toBe(1)
});

test("createTree", async () => {
  const blocksInDB1 = await Block.find().exec()
  expect((blocksInDB1).length).toBe(0)

  const startBlock = await createBlock({})
  let blocks: string[] = [startBlock.id!]
  await recursiveTree(2, startBlock.id!, blocks, 1, 3)
  expect(blocks.length).toBe(15)

  const blocksInDB2 = await Block.find().exec()
  expect((blocksInDB2).length).toBe(15)

  const startBlock1 = await createBlock({})
  let blocks1: string[] = [startBlock1.id!]
  await recursiveTree(3, startBlock1.id!, blocks1, 1, 2)
  expect(blocks1.length).toBe(13)
});

test("addUsersToKOPhase", async () => {
  const participants = [
    john1._id.toString(),
    john2._id.toString(),
    john3._id.toString(),
    john4._id.toString(),
    john5._id.toString(),
    john6._id.toString(),
    john7._id.toString(),
    john8._id.toString(),
  ];

  const kophaseResource = await createKOPhase(8, 2);
  expect(kophaseResource.id).toBeDefined();
  expect(kophaseResource.currentDepth).toBe(3);
  const kophaseId: string = kophaseResource.id!;


  const updatedKOPhaseResource = await addUsersToKOPhase(kophaseId, participants);
  expect(updatedKOPhaseResource.id).toBe(kophaseId.toString());
  expect(updatedKOPhaseResource.totalParticipants).toBe(8);
  expect(updatedKOPhaseResource.blocks).toHaveLength(15);
  expect(updatedKOPhaseResource.currentDepth).toBe(3);

  // Check if participants are in the blocks
  participants.forEach((participant) => {
    const isParticipantInBlocks = updatedKOPhaseResource.blocks.some(async (blockId) => {
      const block = await Block.findById(blockId)
      expect(block?.participant?.toString() === participant)
    });
    expect(isParticipantInBlocks).toBe(true);
  });
  //Check if no participants are in future blocks
  updatedKOPhaseResource.blocks.every(async (blockId) => {
    const block = await Block.findById(blockId)
    if (block?.depth) {
      if (block!.depth < 3)
        expect(block?.participant?.toString() === undefined)
    }
  });
  //checks if participants are in lowest depth
  updatedKOPhaseResource.blocks.every(async (blockId) => {
    const block = await Block.findById(blockId)
    if (block?.depth) {
      if (block!.depth = 3)
        expect(block?.participant?.toString() !== undefined)
    }
  })
});

test("getKOPhase", async () => {
  const kophaseResource = await createKOPhase(8, 2);
  expect(kophaseResource.id).toBeDefined();
  const kophaseId: string = kophaseResource.id!;

  const retrievedKOPhaseResource = await getKOPhase(kophaseId);
  expect(retrievedKOPhaseResource.id).toBe(kophaseId.toString());
  expect(retrievedKOPhaseResource.totalParticipants).toBe(8);
  expect(retrievedKOPhaseResource.blocks).toHaveLength(15);
});

test("deleteKOPhase", async () => {
  const kophaseResource = await createKOPhase(8, 2);
  expect(kophaseResource.id).toBeDefined();
  const kophaseId: string = kophaseResource.id!;

  expect(kophaseResource.id).toBeDefined();

  const noKOPhase = await deleteKOPhase(kophaseId);
  expect(noKOPhase).toBeNull();

  const deletedKOPhase = await KOPhase.findById(kophaseId).exec();
  expect(deletedKOPhase).toBeNull();
});


//ERRORS
test("addUsersToKOPhase - Negativtest", async () => {
  const participants = [
    john1._id.toString(),
    john2._id.toString(),
    john3._id.toString(),
    john4._id.toString(),
    john5._id.toString(),
    john6._id.toString(),
    john7._id.toString(),
    john8._id.toString(),
  ];
  try {
    const nonExistentKOPhaseId = new Types.ObjectId().toString();
    await addUsersToKOPhase(nonExistentKOPhaseId, participants);
  } catch (error: any) {
    expect(error.errorCode).toBe(404);
  }
});

test("getKOPhase -  Negativtest", async () => {
  try {
    const nonExistentKOPhaseId = new Types.ObjectId().toString();
    await getKOPhase(nonExistentKOPhaseId);
  } catch (error: any) {
    expect(error.errorCode).toBe(404);
  }
});

test("deleteKOPhase - KOPhase not found", async () => {
  try {
    const nonExistentKOPhaseId = new Types.ObjectId().toString();
    await deleteKOPhase(nonExistentKOPhaseId);
  } catch (error: any) {
    expect(error.errorCode).toBe(404);
    expect(error.errorMessage).toBe("KOPhase not found");
  }
})

test("addUsersToKOPhase and nextDepth", async () => {
  const participants = [
    john1._id.toString(),
    john2._id.toString(),
    john3._id.toString(),
    john4._id.toString(),
    john5._id.toString(),
    john6._id.toString(),
    john7._id.toString(),
    john8._id.toString(),
  ];

  const kophaseResource = await createKOPhase(8, 2);
  expect(kophaseResource.id).toBeDefined();
  const kophaseId: string = kophaseResource.id!;

  const updatedKOPhaseResource = await addUsersToKOPhase(kophaseId, participants);
  expect(updatedKOPhaseResource.id).toBe(kophaseId.toString());
  expect(updatedKOPhaseResource.totalParticipants).toBe(8);
  expect(updatedKOPhaseResource.blocks).toHaveLength(15);
  expect(updatedKOPhaseResource.currentDepth).toBe(3);


  for (let blockId of updatedKOPhaseResource.blocks) {
    const block = await getBlockByID(blockId)
    if (block.depth == updatedKOPhaseResource.currentDepth) {
      expect(block.blockState).toBe(BLOCKSTATE.onGoing)
    }
  }
  for (let blockId of updatedKOPhaseResource.blocks) {
    const block = await getBlockByID(blockId)
    if (block.depth == updatedKOPhaseResource.currentDepth) {
      expect(block.blockResult).toBe(BLOCKRESULT.notDecided)
    }
  }

  await addScoreForUser(kophaseId, john1._id.toString(), 1)
  await addScoreForUser(kophaseId, john2._id.toString(), 2)
  await addScoreForUser(kophaseId, john3._id.toString(), 3)
  await addScoreForUser(kophaseId, john4._id.toString(), 4)
  await addScoreForUser(kophaseId, john5._id.toString(), 5)
  await addScoreForUser(kophaseId, john6._id.toString(), 6)
  await addScoreForUser(kophaseId, john7._id.toString(), 7)
  const updatedKOPhaseResource1 = await addScoreForUser(kophaseId, john8._id.toString(), 8)
  const block = await Block.find({ participant: john8._id })
  const blockResource = await getBlockByID(block[0].id)
  expect(blockResource.score).toBe(8)

  expect(updatedKOPhaseResource1.id).toBe(kophaseId.toString());
  expect(updatedKOPhaseResource1.totalParticipants).toBe(8);
  expect(updatedKOPhaseResource1.blocks).toHaveLength(15);
  expect(updatedKOPhaseResource1.currentDepth).toBe(3);

  const updatedKOPhaseResource2 = await nextDepth(kophaseId)

  expect(updatedKOPhaseResource2.id).toBe(kophaseId.toString());
  expect(updatedKOPhaseResource2.totalParticipants).toBe(8);
  expect(updatedKOPhaseResource2.blocks).toHaveLength(15);
  expect(updatedKOPhaseResource2.currentDepth).toBe(2);

  for (let blockId of updatedKOPhaseResource2.blocks) {
    const block = await getBlockByID(blockId)
    if (block.depth == updatedKOPhaseResource2.currentDepth) {
      expect(block.blockState).toBe(BLOCKSTATE.onGoing)
    }
  }
  for (let blockId of updatedKOPhaseResource2.blocks) {
    const block = await getBlockByID(blockId)
    if (block.depth == updatedKOPhaseResource2.currentDepth) {
      expect(block.blockResult).toBe(BLOCKRESULT.notDecided)
    }
  }
});