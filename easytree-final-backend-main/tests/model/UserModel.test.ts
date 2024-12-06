import { User } from "../../src/model/UserModel";
import DB from "../DB";

beforeAll(async () => await DB.connect())
afterEach(async () => await DB.clear())
afterAll(async () => await DB.close())

test("addUser", async () => {
    const user = new User({ email: "john@doe.com", name: "John", password: "1234", admin: false})
    const res = await user.save();
    expect(res).toBeDefined();
    expect(res.email).toBe("john@doe.com");
    expect(res.name).toBe("John");
    expect(res.password).not.toBe("1234");
    expect(res.admin).toBe(false);
    expect(res.id).toBeDefined();
    expect(res.isCorrectPassword("1234")).toBeTruthy

    const update = { password: "newpassword" };
    const pw = update?.password;
    expect(pw).toBe("newpassword");
})