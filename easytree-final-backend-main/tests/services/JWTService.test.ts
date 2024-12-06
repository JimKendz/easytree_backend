import { sign, verify } from "jsonwebtoken";
import { User } from "../../src/model/UserModel";
import { verifyJWT, verifyPasswordAndCreateJWT } from "../../src/services/JWTService";
import DB from "../DB";

import * as dotenv from 'dotenv';
dotenv.config();

let idJohn: string

beforeAll(async () => await DB.connect())
beforeEach(async () => {
    User.syncIndexes()
    const john = await User.create({
        email: "john@doe.de", name: "John",
        password: "123", admin: false
    })
    idJohn = john.id;
})
afterEach(async () => await DB.clear())
afterAll(async () => await DB.close())


//verifyPasswordAndCreateJWT
test("JWT wird erzeugt", async () => {
    process.env.JWT_SECRET = "secretJWTkey";
    process.env.JWT_TTL = "3600";

    const jwt = await verifyPasswordAndCreateJWT("john@doe.de", "123");

    expect(jwt).toBeDefined();
});

test("invalid ID", async () => {
    process.env.JWT_SECRET = "secretJWTkey";
    process.env.JWT_TTL = "3600";

    const jwt = await verifyPasswordAndCreateJWT("jane@die.de", "123");

    expect(jwt).toBeUndefined();
});

test("invalid Password", async () => {
    process.env.JWT_SECRET = "secretJWTkey";
    process.env.JWT_TTL = "3600";

    const jwt = await verifyPasswordAndCreateJWT("john@doe.de", "abc");

    expect(jwt).toBeUndefined();
});

test("JWT_Secret not set", async () => {
    process.env.JWT_SECRET = "";
    process.env.JWT_TTL = "3600";

    await expect(verifyPasswordAndCreateJWT("john@doe.de", "123")).rejects.toThrowError("JWT_SECRET not set");
});

test("JWT_TTL not set", async () => {
    process.env.JWT_SECRET = "secretJWTkey";
    process.env.JWT_TTL = "";

    await expect(verifyPasswordAndCreateJWT("john@doe.de", "123")).rejects.toThrowError("JWT_TTL not set");
});

//verifyJWT
test("missing JWT", () => {
    process.env.JWT_SECRET = "secretJWTkey";
  
    expect(() => verifyJWT(undefined)).toThrowError("JWT undefined");
  });
  
  test("empty JWT", () => {
    process.env.JWT_SECRET = "secretJWTkey";
  
    expect(() => verifyJWT("")).toThrowError("something went wrong: JsonWebTokenError: jwt must be provided");
  });
  
  test("wrong signature", () => {
    process.env.JWT_SECRET = "secretJWTkey";
  
    const jwt = sign({ sub: "jane", role: "u" }, "aaa", { expiresIn: "10h" });
  
    expect(() => verifyJWT(jwt)).toThrowError("something went wrong: JsonWebTokenError: invalid signature");
  });
  
  test("consistency check", async () => {
    process.env.JWT_SECRET = "secretJWTkey";
    process.env.JWT_TTL = "3600";
  
    const email = "john@doe.de";
    const password = "123";
  
    const tokenAndName = await verifyPasswordAndCreateJWT(email, password);
    
    // Check if a token was generated
    expect(tokenAndName).toBeDefined();
    
    // Extract the token from the TokenAndName object
    const jwt = tokenAndName?.token;

    // Check if the token is defined
    expect(jwt).toBeDefined();

    const { userId, role } = verifyJWT(jwt);

    expect(userId).toBeDefined();
    expect(role).toBeDefined();
  
    const user = await User.findById(userId);
    expect(user).toBeDefined();
    expect(user?.email).toBe(email);
    expect(user?.admin).toBe(role === "a");
});
  
  test("JWT_SECRET not set", () => {
    process.env.JWT_SECRET = "";
  
    const jwt = sign({ sub: "jane", role: "u" }, "secretJWTkey", { expiresIn: "10h" });
  
    expect(() => verifyJWT(jwt)).toThrowError("JWT_SECRET not set");
  });

  test("invalid token", () => {
    process.env.JWT_SECRET = "a";

    const jwt = sign({ sub: "a", role: "b" }, "a", { expiresIn: "10d" });

    expect(() => verifyJWT(jwt)).toThrowError("invalid_token");
  });
