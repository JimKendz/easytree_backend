import { Schema, model, Types } from 'mongoose';
import { TOURNAMENTSTATE } from '../Enum';

// 1. Create an interface representing a document in MongoDB.
export interface ITournament {
  name: string;
  description?: string;
  public?: boolean;
  tags: string[];
  admins: Types.ObjectId[]
  participants: Types.ObjectId[];
  tournamentSystem: Types.ObjectId[];
  totalParticipants: number;
  participantsPerMatch: number;
  tournamentState?: TOURNAMENTSTATE;
  startDate?: Date;
}

// 2. Create a Schema corresponding to the document interface.
const tournamentSchema = new Schema<ITournament>({
  name: { type: String, min: 3, required: true },
  description: { type: String, default: ""},
  public: {type: Boolean, default: true},
  tags: { type: [String], default: []},
  admins: { type: [Schema.Types.ObjectId], ref: "User", default: [] }, //required, because we need at least one admin
  participants: { type: [Schema.Types.ObjectId], ref: "User", default: []},
  tournamentSystem: { type: [Schema.Types.ObjectId], ref: "KOPhase", default: []}, //ref is the class used. change it if we switch to tournamentSystem interface
  totalParticipants: { type: Number, required: true }, //at first only a value of 2^n is possible
  participantsPerMatch: { type: Number, required: true },
  tournamentState: {
    type: String,
    enum: Object.values(TOURNAMENTSTATE),
    default: TOURNAMENTSTATE.signUpPhase
  },
  startDate: { type: Date, default: undefined }
});

/**
 * @deprecated 
 */
tournamentSchema.method("isAdmin",
  async function name(userID: string): Promise<boolean> {
    let result = false
    for(let admin in this.admins) {
      if(admin === userID) {result = true}
    }
    return result
  }
)

// 3. Create a Model.
export const Tournament = model<ITournament>('Tournament', tournamentSchema);