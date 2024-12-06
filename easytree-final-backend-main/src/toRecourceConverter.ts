import { Types } from "mongoose"
import { IBlock } from "./model/BlockModel"
import { IKOPhase } from "./model/KOPhaseModel"
import { ITournament } from "./model/TournamentModel"
import { IUser } from "./model/UserModel"
import { BlockResource, KOPhaseResource, TournamentResource, UserResource } from "./Resources"
import { TOURNAMENTSTATE } from "./Enum"

export function iTournamentToResource(tournament: ITournament & { _id: Types.ObjectId }): TournamentResource {

    const stringAdmins = tournament.admins.map(v => { return v.toString() })
    const stringParticipants = tournament.participants.map(v => { return v.toString() })
    const stringTournamentSystem = tournament.tournamentSystem.map(v => { return v.toString() })

    const tournamentResource: TournamentResource =
    {
        id: tournament._id.toString(),
        name: tournament.name,
        description: tournament.description ?? "",
        public: tournament.public ?? true,
        tags: tournament.tags,
        admins: stringAdmins,
        participants: stringParticipants,
        tournamentSystem: stringTournamentSystem,
        totalParticipants: tournament.totalParticipants,
        participantsPerMatch: tournament.participantsPerMatch,
        tournamentState: tournament.tournamentState ?? TOURNAMENTSTATE.signUpPhase,
        startDate: tournament.startDate
    }
    return tournamentResource
}

export function iKOPhaseToResource(kophase: IKOPhase & { _id: Types.ObjectId }): KOPhaseResource {

    const stringBlocks = kophase.blocks.map(v => { return v.toString() })

    const kophaseResource: KOPhaseResource =
    {
        id: kophase._id.toString(),
        totalParticipants: kophase.totalParticipants,
        blocks: stringBlocks,
        currentDepth: kophase.currentDepth
    }
    return kophaseResource
}

export function iUserToResource(user: IUser & { _id: Types.ObjectId }): UserResource {

    const userResource: UserResource =
    {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        admin: user.admin
    }
    return userResource
}

export function iBlockToResource(block: IBlock & { _id: Types.ObjectId }): BlockResource {

    const blockResource: BlockResource =
    {
        id: block._id.toString(),
        next: block.next ? block.next.toString() : undefined,
        depth: block.depth,
        participant: block.participant ? block.participant.toString() : undefined,
        score: block.score,
        blockState: block.blockState,
        name: block.name,
        blockResult: block.blockResult
    }
    return blockResource
}