import { IUser, User } from "../../src/model/UserModel"
import { createUser, deleteUser, getUsers, updateUser } from "../../src/services/UserService";
import DB from "../DB";
import { UserResource } from "../../src/Resources";

const johnData: IUser = { email: "john@doe.de", name: "John", password: "1234", admin: false }
let idJohn: string


beforeAll(async () => await DB.connect())
beforeEach(async () => {
    await User.syncIndexes()
    const john = await User.create(johnData)
    idJohn = john.id;
})
afterEach(async () => {
    await DB.clear();
})
afterAll(async () => await DB.close())


test("getUsers mit vorab angelegten Usern", async () => {
    const userResource = await getUsers();
    expect(userResource.users.length).toBe(1);
    expect(userResource.users.find(ur => ur.email === "john@doe.de")?.name).toBe("John")
})

test("getUsers, Passwörter werden nicht zurückgegeben", async () => {
    const userResource = await getUsers();
    expect(userResource.users.length).toBe(1);
    expect(userResource.users.every(ur => !ur.password)).toBeTruthy()
})

test("createUser Jack", async () => {
    const userResource = await createUser({ name: "Jack", email: "jack@doe.de", password: "Hallo", admin: false })
    expect(userResource.name).toBe("Jack")
    expect(userResource.email).toBe("jack@doe.de")
    expect(userResource.admin).toBe(false)
})


test("createUser und getUsers ist konsistent", async () => {
    await createUser({ name: "Jack", email: "jack@doe.de", password: "Hallo", admin: false })
    const userResource = await getUsers();
    expect(userResource.users.length).toBe(2);
    expect(userResource.users.find(ur => ur.email === "jack@doe.de")?.name).toBe("Jack")
    expect(userResource.users.every(ur => !ur.password)).toBeTruthy()
})

/**
 * Hier als Hilfsfunktion, um unabhängig von AuthenticationService zu sein
 */
async function getSingleUser(email: string) {
    const usersResource = await getUsers();
    const userResource = usersResource.users.find(ur => ur.email === email);
    if (!userResource) {
        throw new Error(`Keinen User mit E-Mail ${email} gefunden, kann ID nicht ermitteln.`)
    }
    return userResource;
}

test("updateUser, Name kann geändert werden", async () => {
    const userResource = await getSingleUser("john@doe.de");
    userResource.name = "John Boy";
    const updatedResource = await updateUser(userResource);
    expect(updatedResource.name).toBe("John Boy");
})

test("deleteUser eines existierenden Benutzers", async () => {
    await deleteUser(idJohn);
    const user = await User.findById(idJohn).exec();
    expect(user).toBeFalsy();
});


  
test("updateUser with missing id should throw an error", async () => {
const userResource: UserResource = {
    name: "John Boy",
    email: "john@doe.de",
    admin: true,
};
await expect(updateUser(userResource)).rejects.toThrowError("User id missing, cannot update");
});
  
test("deleteUser with missing id should throw an error", async () => {
    await expect(deleteUser("")).rejects.toThrowError("No id given, cannot delete user.");
});