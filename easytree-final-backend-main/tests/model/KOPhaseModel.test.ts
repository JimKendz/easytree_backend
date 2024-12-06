import { Types } from "mongoose";
import { KOPhase } from "../../src/model/KOPhaseModel";
import DB from "../DB";

beforeAll(async () => await DB.connect())
afterEach(async () => await DB.clear())
afterAll(async () => await DB.close())

test("KOPhase Model", async () => {
    const kophase = new KOPhase({ totalParticipants: 2, blocks: [], currentDepth: 2 })
    const res = await kophase.save();
    expect(res).toBeDefined();
    expect(res.totalParticipants).toBe(2);
    expect(res.blocks).toHaveLength(0);
    expect(res.blocks.every(id => id instanceof Types.ObjectId)).toBe(true);
    expect(res.currentDepth).toBe(2)
    expect(res.id).toBeDefined();
})
