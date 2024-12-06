import dotenv from "dotenv";
dotenv.config();

import "restmatcher";
import supertest from "supertest";
import { LoginResource } from "../../src/Resources";
import app from "../../src/app";
import { User } from "../../src/model/UserModel";
import { createUser } from "../../src/services/UserService";
import DB from "../DB";

let strongPW = "123asdf!ABCD"
let strongPW2 = "$Ab4568910";

beforeAll(async () => { await DB.connect(); })
beforeEach(async () => {
    User.syncIndexes();
    await createUser({ name: "John", email: "john@some-host.de", password: strongPW, admin: false })
})
afterEach(async () => { await DB.clear(); })
afterAll(async () => {
    await DB.close()
})

test("login POST", async () => {
    const request = supertest(app);
    const loginData = { email: "john@some-host.de", password: strongPW};
    const response = await request.post(`/api/login`).send(loginData);
    const loginResource = response.body as LoginResource;
    const token = loginResource.access_token;
    expect(token).toBeDefined();
});


test("wrong password", async () => {
  const request = supertest(app);
  const loginData = { email: "john@some-host.de", password: "1" };
  const response = await request.post(`/api/login`).send(loginData);

  expect(response.status).toBe(400);
});

test("login POST, Negativtest mit fehlenden Passwort", async () => {
    const request = supertest(app);
    const loginData = { email: "john@some-host.de" };
    const response = await request.post(`/api/login`).send(loginData);
    const loginResource = response.body as LoginResource;
    expect(response.statusCode).toBe(400);
    expect(response.body.errors[0]).toBeDefined();
});

test("login POST, Negativtest ungültigen Secret", async () => {
    process.env.JWT_SECRET = "";
    const request = supertest(app);
    const loginData = { email: "john@some-host.de", password: strongPW2 };
    const response = await request.post(`/api/login`).send(loginData);
    const loginResource = response.body as LoginResource;
    expect(response.statusCode).toBe(401);
});