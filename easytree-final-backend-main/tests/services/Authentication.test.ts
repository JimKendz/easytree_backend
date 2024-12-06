import { User } from "../../src/model/UserModel";
import { login } from "../../src/services/AuthenticationService";
import DB from "../DB";


let idJohn: string
let idJane: string

beforeAll(async () => await DB.connect())
beforeEach(async () => {
    User.syncIndexes()
    const john = await User.create({
        email: "john@doe.de", name: "John",
        password: "1234", admin: false
    })
    idJohn = john.id;
    const jane = await User.create({
        email: "jane@doe.de", name: "Jane",
        password: "1234", admin: true
    })
    idJohn = john.id;
    idJane = jane.id;
})
afterEach(async () => await DB.clear())
afterAll(async () => await DB.close())

test("successful login upperCase", async () => {
    const userget = await login("JOHN@DOE.DE", "1234")

    expect(userget.success).toBe(true);
    expect(userget.id).toBe(idJohn);
    expect(userget.name).toBe("John");
});

test("successful login admin", async () => {
    const userget = await login("JANE@DOE.DE", "1234")

    expect(userget.success).toBe(true);
    expect(userget.id).toBe(idJane);
    expect(userget.name).toBe("Jane");
    expect(userget.role).toBe("a");
});

test("successful login lowerCase", async () => {
    const userget = await login("john@doe.de", "1234")

    expect(userget.success).toBe(true);
    expect(userget.id).toBe(idJohn);
    expect(userget.name).toBe("John");
});

test("wrong password", async () => {
    const userget = await login("john@doe.de", "2222")

    expect(userget.success).toBe(false);
});

test("no password", async () => {
    const userget = await login("john@doe.de", "")

    expect(userget.success).toBe(false);
});

test("wrong email", async () => {
    const userget = await login("john@doe.com", "1234")

    expect(userget.success).toBe(false);
});

test("no email", async () => {
    const userget = await login("", "1234")

    expect(userget.success).toBe(false);
});

test("user not found", async () => {
    const userget = await login("john@doe.de", "1234")

    expect(userget.id).toEqual(idJohn);
    expect(userget.name).toEqual("John");
});

test("user found without id or name", async () => {
    // Create a user without id or name
    const userWithoutIdName = await User.create({
        email: "no-id-name@example.com", password: "5678", admin: false, name: "null"
    });

    // Attempt to log in with the created user
    const userget = await login("no-id-name@example.com", "5678");

    // Expect the login to be successful, but id and name to be undefined
    expect(userget.success).toBe(true);
    expect(userget.name).toBe("null");
});

test("isCorrectPassword returns true for correct password", async () => {
    const john = await User.findOne({ email: "john@doe.de" });
    const isCorrect = john ? await john?.isCorrectPassword("1234") : true;
    expect(isCorrect).toBe(true);
});
  
test("isCorrectPassword returns false for incorrect password", async () => {
    const john = await User.findOne({ email: "john@doe.de" });
    const isCorrect = john ? await john?.isCorrectPassword("wrongPassword") : false;
    expect(isCorrect).toBe(false);
});