import supertest from "supertest";
import app from "../../src/app";
import { createKOPhase } from "../../src/services/KOPhaseService";
import { KOPhaseResource } from "../../src/Resources";
import DB from "../DB";
import { Types } from "mongoose";

let kophase: KOPhaseResource;
let kophaseId: Types.ObjectId | undefined;
kophaseId = new Types.ObjectId();
let blocks: Types.ObjectId;
const kophaseIdString: string = kophaseId.toString();
const NON_EXISTING_ID = "61ea44e811cc4200842d7fa5";

beforeAll(async () => await DB.connect());
beforeEach(async () => { await DB.clear();
  kophase = await createKOPhase(8, 2);
});
afterEach(async () => await DB.clear());
afterAll(async () => await DB.close());


test("kophase POST, Negativtest", async () => {
  const request = supertest(app);
  const kophaseData: KOPhaseResource = {
    id: kophaseIdString,
    totalParticipants: 8,
    blocks: [toString()]
  };

  const response = await request
    .post("/api/kophase")
    .send(kophaseData);

  expect(response.statusCode).toBe(400);
});

test("POST /kophase should return 201 status code", async () => {
    const kophaseData = {
      totalParticipants: 8,
      participantsPerMatch: 2,
    };

    const response = await supertest(app)
      .post("/api/kophase")
      .send(kophaseData);

    expect(response.status).toBe(201);
});

test("kophase GET, Positivtest", async () => {
  const request = supertest(app);

  const response = await request
    .get(`/api/kophase/${kophase.id}`);

  expect(response.statusCode).toBe(200);
});

test("kophase GET, Negativtest wrong Id", async () => {
  const request = supertest(app);

  const response = await request
    .get(`/api/kophase/${NON_EXISTING_ID}`);

  expect(response.statusCode).toBe(404);
});

test("kophase DELETE, Positivtest", async () => {
  const request = supertest(app);

  const response = await request
    .delete(`/api/kophase/${kophase.id}`);

  expect(response.statusCode).toBe(204);
});

//Muss nochmal angeschaut werden.
/*
test("kophase DELETE, Negativtest wrong Id", async () => {
  const request = supertest(app);

  const response = await request
    .delete(`/api/kophase/${NON_EXISTING_ID}`);

  expect(response.statusCode).toBe(404);
});
*/

test("POST /kophase/:id/addUsers, Negativtest (Code 500)", async () => {
    const existingKOPhaseId = new Types.ObjectId();
    const participantsData = {
      participants: [
        new Types.ObjectId(),
        new Types.ObjectId(),
      ],
    };

    const response = await supertest(app)
      .post(`/api/kophase/${existingKOPhaseId}/addUsers`)
      .send(participantsData);
    expect(response.status).toBe(404);
});