import app from "../../src/app";
import { createUser } from "../../src/services/UserService";
import { UserResource, UsersResource } from "../../src/Resources";
import DB from "../DB";
import supertest from "supertest"
import { User } from "../../src/model/UserModel";

let john: UserResource

beforeAll(async () => { await DB.connect(); })
beforeEach(async () => {
    // Wir verwenden hier Service-Methoden!
    john = await createUser({ name: "John", email: "john@doe.de", password: "123", admin: false })
})
afterEach(async () => { await DB.clear(); })
afterAll(async () => {
    await DB.close()
})

test("users GET, Negativtest", async () => {
    const request = supertest(app);
    const response = await request.get(`/api/users`);
    expect(response.statusCode).toBe(401);
});