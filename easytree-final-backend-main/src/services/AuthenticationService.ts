import { User } from "../model/UserModel";

/**
 * Prüft Email und Passwort, bei Erfolg wird die ID und der Name des Users zurückgegeben
 * und success ist true. Groß-/Kleinschreibung bei der E-Mail ist zu ignorieren.
 * Falls kein User mit gegebener EMail existiert oder das Passwort falsch ist, wird nur 
 * success mit falsch zurückgegeben. Aus Sicherheitsgründen wird kein weiterer Hinweis gegeben.
 */
export async function login(email: string, password: string): Promise<{ success: boolean, id?: string, name?: string, role?: "u" | "a" }> {
    let role: "u" | "a" | undefined;
    const user = await User.findOne({ email: email.trim().toLowerCase() }).exec()
    if (!user) {
        role = undefined;
        return { success: false }
    }
    const result = await user?.isCorrectPassword(password);
    if (!result) {
        role = undefined;
        return { success: false }
    }
    
    if (user.admin) {
        role = "a"
    } else {
        role = "u";
    }

    return { success: true, id: user.id, name: user.name, role: role }

}