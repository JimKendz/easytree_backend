import { Schema, model, Types } from 'mongoose';
import { BLOCKRESULT, BLOCKSTATE } from '../Enum';

// 1. Create an interface representing a document in MongoDB.
export interface IBlock {
    next?: Types.ObjectId
    depth?: number
    participant?: Types.ObjectId
    score?: number
    blockState?: BLOCKSTATE
    name?: string //name of the participant
    blockResult?: BLOCKRESULT
}

// 2. Create a Schema corresponding to the document interface.
const blockSchema = new Schema<IBlock>({
    next: { type: Schema.Types.ObjectId, ref: "Block", default: undefined },
    depth: { type: Number, default: 0 },
    participant: { type: Schema.Types.ObjectId, ref: "User", default: undefined },
    score: { type: Number, default: 0 },
    blockState: {
        type: String,
        enum: Object.values(BLOCKSTATE),
        default: BLOCKSTATE.scheduled
    },
    name: { type: String, default: undefined },
    blockResult: {
        type: String,
        enum: Object.values(BLOCKRESULT),
        default: BLOCKRESULT.notDecided
    }
});

// 3. Create a Model.
export const Block = model<IBlock>('Block', blockSchema);