import { BlockResource, BlocksResource, CompleteTournamentResource, KOPhaseResource, TournamentResource, TournamentsResource, UserResource, UsersResource } from "../Resources";
import { Types } from "mongoose"
import { IUser, User } from "../model/UserModel"
import { Tournament } from "../model/TournamentModel";
import { TOURNAMENTSTATE } from "../../src/Enum";
import { ITournament } from "../model/TournamentModel";
import { addUsersToKOPhase, createKOPhase, deleteKOPhase } from "./KOPhaseService";
import { IKOPhase, KOPhase } from "../../src/model/KOPhaseModel";
import { Block, IBlock } from "../../src/model/BlockModel";
import { iBlockToResource, iKOPhaseToResource, iTournamentToResource, iUserToResource } from "../../src/toRecourceConverter";

/**
 * @param TournamentResource
 */
export async function createTournament(tournamentResource: TournamentResource): Promise<TournamentResource> {

    //Error handling
    if (!tournamentResource.name) { throw new Error("Error TS01: Name must be given for Tournament creation") }
    if (!tournamentResource.totalParticipants) { throw new Error("Error TS02: totalParticipants must be given for Tournament creation") }
    if (!tournamentResource.participantsPerMatch) { throw new Error("Error TS03: totalParticipants must be given for Tournament creation") }

    //KOPhase creation, before adding it to the Tournament
    let koPhaseForTournie = await createKOPhase(tournamentResource.totalParticipants, tournamentResource.participantsPerMatch ?? 2)

    const createdTournament = await Tournament.create({
        name: tournamentResource.name,
        description: tournamentResource.description,
        public: tournamentResource.public,
        tags: tournamentResource.tags,
        admins: tournamentResource.admins,
        participants: tournamentResource.participants,
        tournamentSystem: [koPhaseForTournie.id],
        totalParticipants: tournamentResource.totalParticipants,
        participantsPerMatch: tournamentResource.participantsPerMatch,
        tournamentState: tournamentResource.tournamentState,
        startDate: tournamentResource.startDate
    })

    return iTournamentToResource(createdTournament)
}

/**
 * @param tournamentID
 * @description tournaments can only be deleted, if they are in the tournamentState "signUpPhase"
 * @throws Error, if the tournamentState is wrong, or nothing is deleted
 */
export async function deleteTournament(id: string): Promise<void> {
    if (!id) { throw new Error("Error TS03: No id given, cannot delete tournament.") }
    //check if state is not signUpPhase (can only be deleted in signUpPhase)
    const tournie = await Tournament.findById(id).exec()
    if (!tournie) {
        throw new Error("Error TS04: No Tournament found with id: " + id)
    } else if (tournie.tournamentState !== TOURNAMENTSTATE.signUpPhase) {
        throw new Error("Error TS05: The Tournament cant be deleted, because of the state: " + tournie.tournamentState)
    }

    await deleteKOPhase(tournie.tournamentSystem[0].toString())  //TODO: if we have more than one TournamentSystem

    //delete (/check if it was deleted)
    const res = await Tournament.deleteOne({ _id: new Types.ObjectId(id) }).exec();
    if (res.deletedCount !== 1) {
        throw new Error(`Error TS06: No Tournament with id ${id} deleted, probably id not valid`);
    }
}


/**
 * @return TournamentsResource
 * @params String containing a Tournament name or Tags
 * @description input string to search for names (of tournaments) or tags
 */
export async function getTournaments(): Promise<TournamentsResource> {
    //Getting all public Tournaments, if you search for *
    let tournies = await Tournament.find({ public: true }).exec();
    if (!tournies) { throw new Error("Error TS16: No tournaments found") }

    let mappedTournie = tournies.map((v) => { return iTournamentToResource(v) })

    let tournamentsResource: TournamentsResource = { tournaments: mappedTournie }
    return tournamentsResource;
}

/**
 * @return TournamentsResource
 * @params String containing a Tournament name or Tags
 * @description input string to search for names (of tournaments) or tags
 */
export async function getTournamentByID(input: string): Promise<TournamentResource> {
    if (!input) { throw new Error("Error TS09: no ID given to search for Tournament") }
    //find with ID
    let foundTournie = await Tournament.findById(input).exec();

    if (!foundTournie) { throw new Error("Error TS10: no Tournament found with this ID") }

    return iTournamentToResource(foundTournie)
}

/**
 * @return CompleteTournamentResource
 * @params ID of a Tournament as a String
 * @description Collects all information of a tournament, including all participants, blocks, etc. \
 * Used for sending the resource to the frontend e.g. for the Dashboard of a tournament.
 */
export async function getCompleteTournamentResourceByID(id: string): Promise<CompleteTournamentResource> {
    if (!id) { throw new Error("Error TS25: no ID given to search for Tournament") }
    //find with ID
    let foundTournie = await Tournament.findById(id).exec()
    if (!foundTournie) { throw new Error("Error TS26: no Tournament found with this ID: " + id) }

    //getting all User infos from the participants of the Tournament
    let allUsers: UsersResource = { users: [] }
    for (let userID of foundTournie.participants) {
        if(userID) {
            let foundUser = await User.findById(userID)
            if (!foundUser) { throw new Error("Error TS27: no KOPhase found with this ID: " + userID) }
            allUsers.users.push(iUserToResource(foundUser))
        }
    }

    let foundKOPhase = await KOPhase.findById(foundTournie.tournamentSystem[0])
    if (!foundKOPhase) { throw new Error("Error TS28: no KOPhase found with this ID: " + foundTournie.tournamentSystem[0]) }

    //getting all Block infos from the KOPhase of the Tournament
    let allBlocks: BlocksResource = { blocks: [] }
    for (let blockID of foundKOPhase.blocks) {
        let foundBlock = await Block.findById(blockID)
        if (!foundBlock) { throw new Error("Error TS29: no KOPhase found with this ID: " + blockID) }
        allBlocks.blocks.push(iBlockToResource(foundBlock))
    }

    //stitching together all resources to one completeTournamentResource
    let completeTournamentResource: CompleteTournamentResource = {
        tournament: iTournamentToResource(foundTournie),
        participants: allUsers,
        kophase: iKOPhaseToResource(foundKOPhase),
        blocks: allBlocks
    }

    return completeTournamentResource
}

/**
 * @return TournamentsResource, depending on the input
 * @description input Types.ObjectId (userID) to search for a Tournament where User is Admin
 */
export async function getTournamentsWhereUserIsAdmin(id: string): Promise<TournamentsResource> {

    if (!id) { throw new Error("Error TS10: no userID given to search for Tournaments"); }

    const tournies = await Tournament.find({ $or: [{ admins: id }] }).exec();

    let mappedTournie = tournies.map((v) => { return iTournamentToResource(v) })

    const tournamentsResource: TournamentsResource = { tournaments: mappedTournie }

    return tournamentsResource;
}

/**
 * @return TournamentsResource, depending on the input
 * @description input Types.ObjectId (userID) to search for a Tournament where User participated
 */
export async function getTournamentsWhereUserIsParticipant(id: string): Promise<TournamentsResource> {

    if (!id) { throw new Error("Error TS10.1: no userID given to search for Tournaments"); }

    const tournies = await Tournament.find({ $or: [{ participants: id }] }).exec();

    let mappedTournie = tournies.map((v) => { return iTournamentToResource(v) })

    const tournamentsResource: TournamentsResource = { tournaments: mappedTournie }

    return tournamentsResource;
}

/**
 * @param TournamentResource
 * @description Updates all information given in the Resource \
 * Does not update: 
 * - Name
 * - Admins
 * - Participants
 * - TournamentSystem
 * - TotalParticipants
 * - ParticipantsPerMatch
 */
export async function updateTournament(tournamentResource: TournamentResource): Promise<TournamentResource> {
    //failchecking
    if (!tournamentResource) throw new Error("Error TS11: no TournamentResource given to update")
    if (!tournamentResource.id) throw new Error("Error TS12: Tournament id missing, cannot update")

    const savedtournie = await Tournament.updateOne({ _id: new Types.ObjectId(tournamentResource.id) }, {
        description: tournamentResource.description,
        public: tournamentResource.public,
        tournamentState: tournamentResource.tournamentState,
        startDate: tournamentResource.startDate,
        tags: tournamentResource.tags
    })

    if (!savedtournie.acknowledged) {
        throw new Error("Error TS75: Could not update Tournament")
    }
    return await getTournamentByID(tournamentResource.id)

    /*
    const tournie = await Tournament.findById(tournamentResource.id).exec()
    if (!tournie) throw new Error(`Error TS13: No Tournament with id ${tournamentResource.id} found, cannot update`)
    //updating whats given
    if (tournamentResource.description) tournie.description = tournamentResource.description;
    if (tournamentResource.public) tournie.public = tournamentResource.public;
    if (tournamentResource.tournamentState) tournie.TOURNAMENTSTATE = tournamentResource.tournamentState;
    if (tournamentResource.startDate) tournie.startDate = tournamentResource.startDate;
    if (tournamentResource.tags) tournie.tags = tournamentResource.tags;
    //saving & returning updated
    const savedtournie = await tournie.save();
    return iTournamentToResource(savedtournie)
    */
}

/**
 * @param (tournamentID & newAdmins)
 * @description adds newAdmins to the admins array of the Tournament with the given IDs
 */
export async function addAdmin(tournamentID: string, newAdmin: string): Promise<TournamentResource> {
    //failchecking
    if (!tournamentID) throw new Error("Error TS17: Tournament id missing, cannot update");
    if (!newAdmin) throw new Error("Error TS18: No Admins given to update");

    const tournie = await Tournament.findById(tournamentID).exec();
    if (!tournie) throw new Error(`Error TS19: No Tournament with id ${tournamentID} found, cannot update Tags`)

    for (let admin of tournie.admins) {
        if (admin.toString() === newAdmin) {
            throw new Error(`Error TS21: Admin with id ${newAdmin} already in this Tournament`);
        }
    }
    //adding the Admin
    let found = await User.findById(newAdmin).exec()
    if (found) {
        tournie.admins.push(found.id)
    } else {
        throw new Error(`Error TS83: No Admin with ID ${newAdmin} found`)
    }
    //saving & returning updated
    const savedtournie = await tournie.save();
    return iTournamentToResource(savedtournie)
}

/**
 * @param (tournamentID & newParticipantID)
 * @description adds newParticipant to the participants array of the Tournament with the given ID
 */
export async function addParticipant(tournamentID: String, newParticipantID: String): Promise<TournamentResource> {
    //failchecking
    if (!tournamentID) throw new Error("Error TS17: Tournament id missing, cannot update");
    if (!newParticipantID) throw new Error("Error TS18: No Participant given to update");

    const tournie = await Tournament.findById(tournamentID).exec();


    if (!tournie) throw new Error(`Error TS19: No Tournament with id ${tournamentID} found, cannot update Tags`)

    //check, if tournament is already full
    if(tournie.participants.length === tournie.totalParticipants) { 
        throw new Error(`Error TS43: Tournament is already full: ${tournie.participants.length} / ${tournie.totalParticipants}`) 
    }
    //check, if User is already in this Tournament
    for (let participant of tournie.participants) {
        if (participant.toString() === newParticipantID) {
            throw new Error(`Error TS21: participant with id ${newParticipantID} already in this Tournament`)
        }
    }
    //adding the participant
    let found = await User.findById(newParticipantID).exec()
    if (found) {
        tournie.participants.push(found.id)
    } else {
        throw new Error(`Error TS84: No participant with ID ${newParticipantID} found`)
    }

    //saving the updated tournament 
    const savedtournie = await tournie.save()
    let savedResource = iTournamentToResource(savedtournie)


    //see, if its now full. Then trigger the filling of the blocks
    if(savedResource.participants!.length === savedResource.totalParticipants) {
        await addUsersToKOPhase(savedResource.tournamentSystem![0], savedResource.participants!)
    }

    return savedResource
}