import { BLOCKRESULT, BLOCKSTATE, TOURNAMENTSTATE } from "./Enum"
import { Types } from "mongoose"
import { ITournament } from "./model/TournamentModel"

export type TokenAndNameAndId = {
    token: string,
    name: string,
    id: string
}

export type UsersResource = {
    users: UserResource[]
}

export type UserResource = {
    id?: string
    name: string
    email: string
    admin: boolean
    password?: string
}

export type LoginResource = {
    /** The JWT */
    "access_token": string,
    /** Constant value */
    "token_type": "Bearer"
}

export type BlocksResource = {
    blocks: BlockResource[]
}
export type BlockResource = {
    id?: string
    next?: string
    depth?: number
    participant?: string
    score?: number
    blockState?: BLOCKSTATE
    name?: string
    blockResult?: BLOCKRESULT
}

export type KOPhaseResource = {
    id?: string
    totalParticipants: number
    blocks: string[]
    currentDepth?: number
}

export type TournamentsResource = {
    tournaments: TournamentResource[]
}
export type TournamentResource = {
    id?: string,
    name: string;
    description?: string;
    public?: boolean;
    tags?: string[];
    admins?: string[] //IDs of the Users
    participants?: string[]; //IDs of the Users
    tournamentSystem?: string[]; //IDs of TournamentSystem / KOPhase
    totalParticipants: number;
    participantsPerMatch: number;
    tournamentState?: TOURNAMENTSTATE;
    startDate?: Date;
}

//Used in the Frontend to display the Dashboard with only on fetch
export type CompleteTournamentResource = {
    tournament: TournamentResource,
    participants: UsersResource,
    kophase: KOPhaseResource,
    blocks: BlocksResource
}