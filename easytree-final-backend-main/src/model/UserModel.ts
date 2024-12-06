import { model, Schema, Model, Query } from "mongoose"
import bcrypt from "bcryptjs"

//Create an interface representing a document in MongoDB

export interface IUser {
    email: string;
    name: string;
    password: string;
    admin: boolean;
}

interface IUSerMethods {
    isCorrectPassword(cadidatePassword: string): Promise<boolean>
}

type UserModel = Model<IUser, {}, IUSerMethods>

//Create a Schema corresponding to the document interface
const userSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true},
    name: { type: String, required: true, unique: true},
    password: {type: String, required: true},
    admin: { type: Boolean, default: false}
});

//save
userSchema.pre("save", {document: true, query: false}, async function () {
    if(this.isModified("password")) {
        const hashedPassword = await bcrypt.hash(this.password, 10);
        this.password = hashedPassword;
    }
})

//updateOne
userSchema.pre("updateOne", async function() {
    const update = this.getUpdate() as Query<any, IUser> & { password?: string} | null;
    if (update && update.password) {
        const hashedPassword = await bcrypt.hash(update.password, 10);
        update.password = hashedPassword;        
    }
});

//updateMany
userSchema.pre("updateMany", async function() {
    const update = this.getUpdate() as Query<any, IUser> & { password?: string} | null;
    if (update && update.password) {
        const hashedPassword = await bcrypt.hash(update.password, 10);
        update.password = hashedPassword;
    }
})

//isCorrectPassword
userSchema.method("isCorrectPassword",
    async function (candidatePassword: string): Promise<boolean> {
        if (this.isModified()) {
            throw new Error("User is modified, cannot compare passwords");
        }
        const result = await bcrypt.compare(candidatePassword, this.password);
        return result;
    }
);

//Create a Model
export const User = model<IUser, UserModel>("User", userSchema);