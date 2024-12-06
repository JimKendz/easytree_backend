import { fillDatabank } from "../../src/data";
import DB from "../DB";

beforeAll(async () => await DB.connect())
afterEach(async () => await DB.clear())
afterAll(async () => await DB.close())

test("fill database", async () => {
    const data = await fillDatabank();

    expect(data).toBe(undefined);
});