import supertest from "supertest";
import app from "../../src/app";
import { User } from "../../src/model/UserModel";
import { createUser, updateUser } from "../../src/services/UserService";
import { LoginResource, UserResource } from "../../src/Resources";
import DB from "../DB";
import { Types } from "mongoose";

let john: UserResource
const NON_EXISTING_ID = "61ea44e811cc4200842d7fa5";
let passwordStrong = "$Ab4568910";
let token: string
let irfan: UserResource
let mongoID = new Types.ObjectId("012345678910").toString();

beforeAll(async () => { await DB.connect(); })
beforeEach(async () => {
    // Wir verwenden hier Service-Funktionen!
    john = await createUser({ name: "John", email: "john@doe.de", password: "123", admin: false })

    irfan = await createUser({ name: "Irfan", email: "irfan@doe.de", password: passwordStrong, admin: true })

})
afterEach(async () => { await DB.clear(); })
afterAll(async () => {
    await DB.close()
})
/*
test("user POST, Positivtest", async () => {
    const request = supertest(app);
    const jane: UserResource = { name: "Jane", email: "jane@doe.de", password: "aBc123.,def!", admin: false };
    const response = await request.post(`/user`).send(jane);

    const janeModel = await User.findOne({ email: "jane@doe.de" });
    expect(janeModel).toBeDefined();

    expect(response.statusCode).toBe(201);
    const userRes = response.body as UserResource;
    const { password, ...expected } = { ...jane, id: janeModel!.id };
    expect(userRes).toEqual(expected);
});
*/
/*
test("user PUT, Positivtest", async () => {
    const request = supertest(app);
    const update: UserResource = { id: john.id, name: "Jane", email: "jane@doe.de", admin: false }

    const response = await request.put(`/user/${update.id}`).send(update);

    expect(response.statusCode).toBe(401);
    const updateRes = response.body as UserResource;
    expect(updateRes).toEqual({ ...update });
});
*/

test("user DELETE, Negativtest", async() => {
    const request = supertest(app);
    const response = await request.delete(`/api/user/${john.id}`);
    
    expect(response.statusCode).toBe(401);
});

//Negativtest

test("user POST, Negativtest", async () => {
    const request = supertest(app);
    const dupeUser = { name: "Jane", email: "john@doe.de", password: "abc", admin: false }; // Email already exists
    const response = await request.post('/api/user').send(dupeUser);

    expect(response.statusCode).toBe(400);
});

test("user PUT, Negativtest wrong Id", async () => {
    const request = supertest(app);
    const update = { id: NON_EXISTING_ID, name: "Jane", email: "jane@doe.de", admin: false };
    const response = await request.put(`/api/user/${NON_EXISTING_ID}`).send(update);

    expect(response.statusCode).toBe(401);
});

test("user PUT, Negativtest", async () => {
    const request = supertest(app);
    const userResource = { name: "Jane" };
    const response = await request.put(`/api/user/${john.id}`).send(userResource);

    expect(response.statusCode).toBe(401);
});

test("user DELETE, Negativtest", async() => {
    const request = supertest(app);
    const response = await request.delete(`/api/user/${NON_EXISTING_ID}`);

    expect(response.statusCode).toBe(401);
});

//Validation Tests

test("user PUT, Negativtest wrong Id", async () => {
    const request = supertest(app);
    const update = { id: NON_EXISTING_ID, name: "Jane", email: "jane@doe.de", admin: false };
    const response = await request.put(`/api/user/${"NON_EXISTING_ID"}`).send(update);

    expect(response.statusCode).toBe(401);
});

test("user PUT, Negativtest", async () => {
    const request = supertest(app);
    const userResource = { name: "Jane" };
    const response = await request.put(`/api/user/${"john.id"}`).send(userResource);

    expect(response.statusCode).toBe(401);
});

test("user DELETE, Negativtest", async() => {
    const request = supertest(app);
    const response = await request.delete(`/api/user/${"NON_EXISTING_ID"}`);

    expect(response.statusCode).toBe(401);
});



test("user POST, Positivtest mit Token", async () => {

    const request = supertest(app);
    const jane: UserResource = { name: "Jane", email: "jane@doe.de", password: passwordStrong, admin: false };

    const response = await request
        .post(`/api/user`)
        .set("Authorization", `Bearer ${token}`) // setzen des Tokens mit Authentifizierung
        .send(jane);

    const janeModel = await User.findOne({ email: "jane@doe.de" });
    expect(janeModel).toBeDefined();

    expect(response.statusCode).toBe(201);
    const userRes = response.body as UserResource;

    const { password, ...expected } = { ...jane, id: janeModel!.id };
    expect(userRes).toEqual(expected);
});
test("user Delete", async () => {

    const request = supertest(app);
    const jane: UserResource = { name: "Jane", email: "jane@doe.de", password: passwordStrong, admin: false };

    const response = await request
        .post(`/api/user`)
        .set("Authorization", `Bearer ${token}`) // setzen des Tokens mit Authentifizierung
        .send(jane);

    const janeModel = await User.findOne({ email: "jane@doe.de" });
    expect(janeModel).toBeDefined();
    const response2 = await request.delete(`/api/user/${jane.id}`);

    expect(response2.statusCode).toBe(401);
});

test("user POST, Positivtest mit Token", async () => {

    const request = supertest(app);
    const jane: UserResource = { name: "Jane", email: "jane@doe.de", password: passwordStrong, admin: false };

    const response = await request
        .post(`/api/user`)
        .set("Authorization", `Bearer ${token}`)
        .send(jane);

    const janeModel = await User.findOne({ email: "jane@doe.de" });
    expect(janeModel).toBeDefined();

    expect(response.statusCode).toBe(201);
    const userRes = response.body as UserResource;

    // ... als Spread-Operator, um Eigenschaften aus einem Objekt zusammenzufassen oder aufzuteilen
    // const { password, ...expected } => expected hat alle Eigenschaften des ursprünglichen Objekts außer password
    // { ...jane, id: janeModel!.id } erstellt aus Eigenschaften von Jane und der id ein neues Objekt
    const { password, ...expected } = { ...jane, id: janeModel!.id };
    // Wir wollen prüfen, ob alle Informationen außer das Password auch im response.body enthalten sind
    expect(userRes).toEqual(expected);
});

test("user POST, Negativtest Negativtest mit bereits vorhandenen Namen (unique) in der DB", async () => {
    const request = supertest(app);
    const momo: UserResource = { name: "Irfan", email: "jane@doe.de", password: passwordStrong, admin: false };
    // User kann nicht erzeugt werden
    const response = await request
        .post(`/api/user`)
        .set("Authorization", `Bearer ${token}`) // setzen des Tokens mit Authentifizierung
        .send(momo);

    const janeModel = await User.findOne({ email: "jane@doe.de" });
    expect(janeModel).toBeNull;
    expect(response.statusCode).toBe(404);
});

test("user POST, Negativtest Negativtest mit bereits vorhandenen Namen (unique) in der DB", async () => {
    const request = supertest(app);
    const momo: UserResource = { name: "Neu", email: "irfan@doe.de", password: passwordStrong, admin: false };
    // User kann nicht erzeugt werden
    const response = await request
        .post(`/api/user`)
        .set("Authorization", `Bearer ${token}`) // setzen des Tokens mit Authentifizierung
        .send(momo);

    const janeModel = await User.findOne({ email: "jane@doe.de" });
    expect(janeModel).toBeNull;
    expect(response.statusCode).toBe(404);
});

test("user PUT, Negativtest2", async () => {
    const request = supertest(app);
    const update: UserResource = { id: john.id, name: "Jane", email: "jane@doe.de", admin: false }

    const response = await request
        .put(`/api/user/${update.id}`)
        .set("Authorization", `Bearer ${token}`) // setzen des Tokens mit Authentifizierung
        .send(update);
    expect(response.statusCode).toBe(401);
});

test("user PUT, Negativtest mit zwei verschiedenen ids", async () => {
    const request = supertest(app);
    const update: UserResource = { id: john.id, name: "Jane", email: "jane@doe.de", admin: false }

    const mongoID = new Types.ObjectId("012345678910").toString();

    const response = await request
        .put(`/api/user/${mongoID}`)
        .set("Authorization", `Bearer ${token}`) // setzen des Tokens mit Authentifizierung
        .send(update);

    expect(response.statusCode).toBe(401);
});

test("user PUT, Negativtest mit bereits vorhandenen Namen (unique) in der DB", async () => {
    const request = supertest(app);
    const update: UserResource = { id: john.id, name: "Irfan", email: "jane@doe.de", admin: false }
    const response = await request
        .put(`/api/user/${update.id}`)
        .set("Authorization", `Bearer ${token}`) // setzen des Tokens mit Authentifizierung
        .send(update);

    expect(response.statusCode).toBe(401);
});

test("user PUT, Negativtest mit bereits vorhandener email (unique) in der DB", async () => {
    const request = supertest(app);
    const update: UserResource = { id: john.id, name: "Neu", email: "irfan@doe.de", admin: false }
    const response = await request
        .put(`/api/user/${update.id}`)
        .set("Authorization", `Bearer ${token}`) // setzen des Tokens mit Authentifizierung
        .send(update);

    expect(response.statusCode).toBe(401);
});

test("user PUT, Negativtest mit idRessources, die nicht existiert", async () => {
    const request = supertest(app);
    const update: UserResource = { id: mongoID, name: "Irfan", email: "irfan@doe.de", admin: false }

    const response = await request
        .put(`/api/user/${mongoID}`)
        .set("Authorization", `Bearer ${token}`) // setzen des Tokens mit Authentifizierung
        .send(update);

    expect(response.statusCode).toBe(401);
});

test("user DELETE, Negativtest3", async () => {
    const request = supertest(app);
    const response = await request
        .delete(`/api/user/${john.id}`)
        .set("Authorization", `Bearer ${token}`); // setzen des Tokens mit Authentifizierung

    expect(response.statusCode).toBe(401);
});

test("user DELETE, Negativtest mit ungültiger id", async () => {
    const request = supertest(app);
    const response = await request
        .delete(`/api/user/${mongoID}`)
        .set("Authorization", `Bearer ${token}`) // setzen des Tokens mit Authentifizierung;

    expect(response.statusCode).toBe(401);
});

test("user POST, Positivtest ohne Token", async () => {

    const request = supertest(app);
    const jane: UserResource = { name: "Jane", email: "jane@doe.de", password: passwordStrong, admin: false };

    const response = await request
        .post(`/api/user`)
        .send(jane);

    const janeModel = await User.findOne({ email: "jane@doe.de" });
    expect(janeModel).toBeDefined();

    expect(response.statusCode).toBe(201);
});

test("user POST, Positivtest mit falschen Token", async () => {

    const request = supertest(app);
    const jane: UserResource = { name: "Jane", email: "jane@doe.de", password: passwordStrong, admin: false };

    const response = await request
        .post(`/api/user`)
        .set("Authorization", `Bearer ${token}123`) // setzen des Tokens mit Authentifizierung
        .send(jane);

    const janeModel = await User.findOne({ email: "jane@doe.de" });
    expect(janeModel).toBeDefined();

    expect(response.statusCode).toBe(201);

});
test("user POST, Positivtest mit nicht Admin", async () => {

    const request = supertest(app);
    const loginData = { email: john.email, password: passwordStrong };
    const responseLog = await request.post(`/api/login`).send(loginData);
    const loginResource = responseLog.body as LoginResource;
    token = loginResource.access_token;
    expect(token).toBeUndefined();

    const jane: UserResource = { name: "Jane", email: "jane@doe.de", password: passwordStrong, admin: false };

    const response = await request
        .post(`/api/user`)
        .set("Authorization", `Bearer ${token}`) // setzen des Tokens mit Authentifizierung
        .send(jane);

    expect(response.statusCode).toBe(201);
});

test("user PUT, Negativtest mit nicht Admin", async () => {

    // Login um Token zu erhalten
    const request = supertest(app);
    const loginData = { email: john.email, password: passwordStrong };
    const responseLog = await request.post(`/api/login`).send(loginData);
    const loginResource = responseLog.body as LoginResource;
    token = loginResource.access_token;
    expect(token).toBeUndefined();

    const update: UserResource = { id: john.id, name: "Jane", email: "jane@doe.de", admin: false }

    const response = await request
        .put(`/api/user/${update.id}`)
        .set("Authorization", `Bearer ${token}`) // setzen des Tokens mit Authentifizierung
        .send(update);


    expect(response.statusCode).toBe(401);
});

test("user DELETE, Negativtest Admin löscht User", async () => {

    const request = supertest(app);
    const response = await request
        .delete(`/api/user/${john.id}`)
        .set("Authorization", `Bearer ${token}`); // setzen des Tokens mit Authentifizierung

    expect(response.statusCode).toBe(401);
    
});

test("user DELETE, Negativtest mit nicht Admin", async () => {

    // Login um Token zu erhalten
    const request = supertest(app);
    const loginData = { email: john.email, password: passwordStrong };
    const responseLog = await request.post(`/api/login`).send(loginData);
    const loginResource = responseLog.body as LoginResource;
    token = loginResource.access_token;
    expect(token).toBeUndefined();

    const response = await request
        .delete(`/api/user/${irfan.id}`)
        .set("Authorization", `Bearer ${token}`); // setzen des Tokens mit Authentifizierung

    expect(response.statusCode).toBe(401);
});

test("user DELETE, Negativtest Admin löscht sich selbst", async () => {

    const request = supertest(app);
    const admin = await createUser({ name: "admin", email: "admin@doe.de", password: passwordStrong, admin: true })


    const response = await request
        .delete(`/api/user/${admin.id}`)
        .set("Authorization", `Bearer ${token}`); // setzen des Tokens mit Authentifizierung

    expect(response.statusCode).toBe(401);
});