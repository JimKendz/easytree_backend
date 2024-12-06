import bcrypt from "bcryptjs";
import mongoose from 'mongoose';
import { IUser, User } from "../../src/model/UserModel";
import DB from "../DB";

beforeAll(async () => await DB.connect())
beforeEach(async () => await User.syncIndexes())
afterEach(async () => await DB.clear())
afterAll(async () => await DB.close())

test("save User", async () => {
    const user = new User({ 
        email: "john@doe.com", 
        name: "John", 
        password: "1234", 
        admin: false
    })
    const res = await user.save();
    expect(res).toBeDefined();
    expect(res.password).not.toBe("1234");
    expect(await bcrypt.compare("1234", res.password)).toBe(true);
    expect(res.id).toBeDefined();
})

test("save User, wrong password", async () => {
    const user = new User({ 
      email: "john@doe.com", 
      name: "John", 
      password: "1234", 
      admin: false
    });
    await user.save();
    const res = await user.isCorrectPassword("5678");
    expect(res).toBe(false);
  });

test("updateOne User, isCorrectPassword", async () => {
    const user = await User.create({
      email: "john@doe.com",
      name: "John",
      password: "1234",
      admin: false,
    })
    const res = await User.updateOne({ email: "john@doe.com" }, { password: "5678" });
    expect(res.modifiedCount).toBe(1);
    const userUpdated = await User.find({ email: "john@doe.com" })
    expect(await bcrypt.compare("5678", userUpdated[0].password)).toBe(true);
  });

test("Error User not saved", async () => {
    const user = new User({ 
        email: "john@doe.com", 
        name: "John", 
        password: "1234", 
        admin: false
    });
    await expect(user.isCorrectPassword("1234")).rejects.toThrow("User is modified, cannot compare passwords");
});

test("Error modified, but not saved", async () => {
    const user = new User({ 
        email: "john@doe.com", 
        name: "John", 
        password: "1234", 
        admin: false
    });
    await user.save();
    user.password = "5678";
    await expect(user.isCorrectPassword("5678")).rejects.toThrow("User is modified, cannot compare passwords");
});

test("updateMany User", async () => {
    const user1 = new User({
        email: "john@doe.com",
        name: "John",
        password: "1234",
        admin: false,
    });
    const user2 = new User({
        email: "joe@doe.com",
        name: "Joe",
        password: "5678",
        admin: false,
    });
    await User.insertMany([user1, user2]);
    const res = await User.updateMany({}, { password: "9999" });
    expect(res.modifiedCount).toBe(2);
    const userUpdated = await User.find();
    expect(await bcrypt.compare("9999", userUpdated[0].password)).toBe(true);
    expect(await bcrypt.compare("9999", userUpdated[1].password)).toBe(true);
});
