import { Types } from "mongoose";
import { KOPhase } from "../model/KOPhaseModel";
import { BlockResource, BlocksResource, KOPhaseResource } from "../Resources";
import { createBlock, deleteBlockByID, getBlockByID, updateBlock } from "./BlockService";
import { Block } from "../../src/model/BlockModel";
import { User } from "../../src/model/UserModel";
import { BLOCKRESULT, BLOCKSTATE } from "../Enum";
import { iKOPhaseToResource } from "../../src/toRecourceConverter";

/**
 * 
 * Creates an KoPhase dynamicaly depending on totalParticipants
 * @param totalParticipants m^n only !
 * @param participantsPerMatch 
 * @returns KOPhaseResource for the created KOPhase
 * @throws if totalParticipants is not m^n
 */

export async function createKOPhase(totalParticipants: number, participantsPerMatch: number): Promise<KOPhaseResource> {
    if (!totalParticipants || !participantsPerMatch) throw new Error("totalParticipants or participantsPerMatch not given for KOPhase creation")
    if (totalParticipants % participantsPerMatch !== 0) throw new Error("participants isn't m%n")

    let tmp = totalParticipants
    let rounds: number = 0
    let failsafe: number = 0

    while (tmp > 1) {
        tmp = tmp / participantsPerMatch
        rounds++

        failsafe++
        if (failsafe > 1000) throw new Error("Infinite loop in createKOPhase. totalParticipants and participantsPerMatch probably dont match up.")
    }

    const initialDepth = rounds
    //linking the created Blocks as next(s)
    const startBlock = await createBlock({})

    let blocks: string[] = [startBlock.id!]
    await recursiveTree(participantsPerMatch, startBlock.id!, blocks, 1, initialDepth)

    const kophase = await KOPhase.create({
        totalParticipants: totalParticipants,
        blocks: blocks,
        currentDepth: rounds
    })

    return getKOPhase(kophase.id);
}

/**
 * Fills the blocks array with ids from initalisized blocks
 * @param participantsPerMatch 
 * @param nextBlockID 
 * @param blocks 
 * @param depth 
 * @returns 
 */
export async function recursiveTree(participantsPerMatch: number, 
    nextBlockID: string, blocks: string[], depth: number, maxDepth: number): Promise<void> {
    if (depth == maxDepth + 1) return

    for (let i = 0; i < (participantsPerMatch); i++) {
        const block = await createBlock({
            next: nextBlockID!,
            depth: depth
        })
        blocks.push(block.id!)
        const newDepth = depth + 1
        await recursiveTree(participantsPerMatch, block.id!, blocks, newDepth, maxDepth)
    }
}

/**
 * checks Winners in currentDepth and assignes new FrontendStates and assignes Winner to next Blocks
 * @param koPhaseId 
 */
export async function nextDepth(koPhaseId: string): Promise<KOPhaseResource> {
    //filter all blocks with currentDepth
    const kophase = await getKOPhase(koPhaseId)
    let currentBlocks: BlockResource[] = []

    for (let blockId of kophase.blocks) {
        const block = await getBlockByID(blockId)
        if (block) {
            if (block.depth! >= 0) {
                if (block.depth == kophase.currentDepth) {
                    currentBlocks.push(block)
                }
            }
        }
    }
    //map all currentBlocks to a Map with <Key(id), Value(next)>
    const matchMap = new Map()
    for (let blockResource of currentBlocks) {
        matchMap.set(blockResource.id, blockResource.next)
    }

    //create Own BlocksResource for every Match
    const matches: BlocksResource[] = []
    let alreadyUsed: string[] = []
    let index = 0
    for (let pair of matchMap) {
        const next = pair[1]
        if (alreadyUsed.includes(next)) continue
        matches.push({
            blocks: []
        })
        for (let pair of matchMap) {
            if (pair[1] == next) {
                const block = await getBlockByID(pair[0])
                matches[index].blocks.push(block)
            }
        }
        alreadyUsed.push(next)
        index++
    }

    for (let match of matches) {
        checkSameScore(match)
    }
    for (let match of matches) {
        await setWinner(match)
    }
    const update = await KOPhase.updateOne({ _id: new Types.ObjectId(kophase.id) }, {
        currentDepth: kophase.currentDepth! - 1
    }).exec()
    if (!update.acknowledged) throw new Error("1003")
    return await getKOPhase(koPhaseId)
}

/**
 * looks for the Winner in a Match
 * @param blocksResource 
 */
async function setWinner(blocksResource: BlocksResource): Promise<void> {
    const highest = highestScore(blocksResource)
    for (let block of blocksResource.blocks) {
        if (block.score == highest) {
            try {
                await updateBlock({
                    id: block.id,
                    blockResult: BLOCKRESULT.winner,
                    blockState: BLOCKSTATE.completed
                });
                await updateBlock({
                    id: block.next,
                    participant: block.participant,
                    name: block.name,
                    blockState: BLOCKSTATE.onGoing
                });
            }
            catch (err) {

            }
        }
        else {
            await updateBlock({
                id: block.id,
                blockResult: BLOCKRESULT.loser,
                blockState: BLOCKSTATE.completed
            })
        }
    }
}

/**
 * checks if matches have highest highscore
 * @param blocksResource 
 */
function checkSameScore(blocksResource: BlocksResource): void {
    const highest = highestScore(blocksResource)
    let count = 0
    for (let blockResource of blocksResource.blocks) {
        if (blockResource.score == highest)
            count++
    }
    if (count > 1) throw new Error("4000 Matches have same scores")
}

function highestScore(blocksResource: BlocksResource): number {
    let highest = 0
    for (let block of blocksResource.blocks) {
        if (block.score !== undefined)
            if (block.score > highest) highest = block.score
    }
    return highest
}

/**
 * Adds users to the participants array of the KOPhase. 
 * Later, the participants are added into the blocks that make up the tree.
 * @param kophaseId The ID of the KOPhase.
 * @param participants An array of participant IDs to be added.
 * @returns KOPhaseResource (itself)
 */
export async function addUsersToKOPhase(kophaseId: string, participants: string[]): Promise<KOPhaseResource> {
    // Find the existing KOPhase by ID
    const existingKOPhase = await KOPhase.findById(kophaseId).exec()
    if (!existingKOPhase) {
        throw { errorCode: 404, errorMessage: "KOPhase not found" };
    }

    //Sucht alle Blocks mit der niedrigsten Tiefe und speichert sie in einem seperaten Array
    const deepBlocks: string[] = []
    for (let blockId of existingKOPhase.blocks) {
        const block = await Block.findById(blockId)
        if (block && block.depth) {
            if (block.depth == existingKOPhase.currentDepth) {
                deepBlocks.push(blockId.toString())
            }
        }
    }

    //Shuffled die Participants und soll danach die Blocks aus dem erstellten Array einen Participant hinzufügen
    const shuffledParticipants = shuffleArray(participants)
    let count = 0
    for (let participant of shuffledParticipants) {
        let user = await User.findById(participant)
        if (user) {
            await updateBlock({
                id: deepBlocks[count],
                participant: participant,
                name: user.name
            })
        }
        count++
    }
    //Alle Blöcke in onGoingState ändern
    for (let deepBlockID of deepBlocks) {
        await updateBlock({
            id: deepBlockID,
            blockState: BLOCKSTATE.onGoing
        })
    }
    return iKOPhaseToResource(existingKOPhase)
}

/**
 * Shuffles the elements of an array randomly.
 * @param array The array to be shuffled.
 * @returns A new array with the elements randomly shuffled.
 */
export function shuffleArray<T>(array: T[]): T[] {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
}

/**
 * Retrieves the KOPhase with the given ID.
 * @param kophaseId The ID of the KOPhase to retrieve.
 * @returns KOPhaseResource containing information about the retrieved KOPhase.
 */
export async function getKOPhase(kophaseId: string): Promise<KOPhaseResource> {
    // Finde die KOPhase basierend auf der KOPhase-ID
    const foundKOPhase = await KOPhase.findById(kophaseId).exec()

    if (!foundKOPhase) {
        throw { errorCode: 404, errorMessage: "KOPhase not found" };
    }

    // Erstelle die Ressourcenklasse für die Antwort
    const blocks = foundKOPhase.blocks.map(blockId => {
        return blockId._id.toString()
    })

    const kophaseResource: KOPhaseResource = {
        id: foundKOPhase.id,
        totalParticipants: foundKOPhase.totalParticipants,
        blocks: blocks,
        currentDepth: foundKOPhase.currentDepth
    };

    return kophaseResource;
}

export async function addScoreForUser(kophaseId: string, userId: string, score: number): Promise<KOPhaseResource> {
    const kophase = await getKOPhase(kophaseId)
    const updateBlock = await Block.find({ $and: [{ participant: userId }, { depth: kophase.currentDepth }] }).exec()
    if (updateBlock[0]) {
        await Block.updateOne({ _id: updateBlock[0]._id }, {
            score: score
        })
    }
    return kophase
}

/**
 * Deletes the KOPhase with the specified ID.
 * @param koPhaseID The ID of the KOPhase to be deleted.
 * @returns null if the KOPhase is successfully deleted.
 *          { errorCode: 404, errorMessage: "KOPhase not found" } if the KOPhase is not found.
 *          { errorCode: 500, errorMessage: "Internal Server Error" } if an internal server error occurs.
 */
export async function deleteKOPhase(koPhaseID: string): Promise<null | { errorCode: number, errorMessage: string }> {
    let kophase = await getKOPhase(koPhaseID)
    if (!kophase) { throw new Error("ERR187: KOPhase not found") }
    //delete blocks associated with this KOPhase
    for (let blockId of kophase.blocks) {
        await deleteBlockByID(blockId)
    }

    // Finde die KOPhase basierend auf der KOPhase-ID und lösche sie
    const result = await KOPhase.deleteOne({ _id: new Types.ObjectId(koPhaseID) });

    // Rückgabe von 'null', da die KOPhase erfolgreich gelöscht wurde
    return null;

}