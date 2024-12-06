import { Schema, model, Types } from 'mongoose';

// 1. Create an interface representing a document in MongoDB.
export interface IKOPhase {
  totalParticipants: number // Tournament-Size
  blocks: Types.ObjectId[] // Match-IDs
  currentDepth: number
}

// 2. Create a Schema corresponding to the document interhis.face.
const KOPhaseSchema = new Schema<IKOPhase>({
  totalParticipants: {
    type: Number,
    required: true,
    ref: "User",
  },
  blocks: {
    type: [Schema.Types.ObjectId],
    default: [],
    ref: "Block",
  },
  currentDepth: { 
    type: Number, 
    default: 0 }
});

// 3. Create a Model.
export const KOPhase = model<IKOPhase>("KOPhase", KOPhaseSchema);