import { verify, sign, JwtPayload } from "jsonwebtoken";
import { User } from "../model/UserModel";
import dotenv from "dotenv";
import { login } from "./AuthenticationService";
import { TokenAndNameAndId } from "src/Resources";

dotenv.config()

const jwtSecret = process.env.JWT_SECRET ? process.env.JWT_SECRET : "secretJWTkey";
const jwtTTL = process.env.JWT_TTL ? parseInt(process.env.JWT_TTL) : 3000000;
/**
 * Prüft Email und Passwort, bei Erfolg wird ein String mit einem JWT-Token zurückgegeben.
 *  
 * Die zur Unterzeichnung notwendige Passphrase wird aus der Umgebungsvariable `JWT_SECRET` gelesen,
 * falls diese nicht gesetzt ist, wird ein Fehler geworfen.
 * Die Zeitspanne, die das JWT gültig ist, also die 'Time To Live`, kurz TTL, wird der Umgebungsvariablen
 * `JWT_TTL` entnommen. Auch hier wird ein Fehler geworfen, falls diese Variable nicht gesetzt ist.
 * 
 * Wir schreiben die Rolle nur mit "u" oder "a" in das JWT, da wir nur diese beiden Rollen haben und 
 * wir das JWT so klein wie möglich halten wollen.
 * 
 * @param email E-Mail-Adresse des Users
 * @param password Das Passwort des Users
 * @returns JWT als String, im JWT ist sub gesetzt mit der Mongo-ID des Users als String sowie role mit "u" oder "a" (User oder Admin); 
 *      oder undefined wenn Authentifizierung fehlschlägt.
 */
export async function verifyPasswordAndCreateJWT(email: string, password: string): Promise<TokenAndNameAndId | undefined> {
    const log = await login(email, password);
    if (!log.success) {
        return undefined;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw Error("JWT_SECRET not set");
    }

    if (!process.env.JWT_TTL) {
        throw Error("JWT_TTL not set");
    }
    const ttl = parseInt(process.env.JWT_TTL);

    const payload: JwtPayload = {
        sub: log.id,
        name: log.name,
        role: log.role
    }
    const jwtString = sign(payload, secret, { expiresIn: ttl, algorithm: "HS256" });

    const tokenAndNameAndId: TokenAndNameAndId = {token: jwtString, name: payload.name, id: payload.sub!}
    return tokenAndNameAndId
}

/**
 * Gibt user id (Mongo-ID) und ein Kürzel der Rolle zurück, falls Verifizierung erfolgreich, sonst wird ein Error geworfen.
 * 
 * Die zur Prüfung der Signatur notwendige Passphrase wird aus der Umgebungsvariable `JWT_SECRET` gelesen,
 * falls diese nicht gesetzt ist, wird ein Fehler geworfen.
 * 
 * @param jwtString das JWT
 * @return user id des Users (Mongo ID als String) und Rolle (u oder a) des Benutzers; 
 *      niemals undefined (bei Fehler wird ein Error geworfen)
 */
export function verifyJWT(jwtString: string | undefined): {userId: string, name: string, role: "u" | "a"} {
    if (jwtString === undefined) {
        throw new Error("JWT undefined")
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw Error("JWT_SECRET not set");
    }
    try {
        const payload = verify(jwtString, secret);
        if (typeof payload === 'object'
            && "sub" in payload
            && "role" in payload 
            && "name" in payload && payload.sub && payload.name && payload.role) {
            return { userId: payload.sub, name:payload.name, role: payload.role }
        }
    } catch (err) {
        throw new Error("something went wrong: " + err)
    }
    throw new Error("invalid_token")

}
