import { BlockResource, KOPhaseResource } from "../Resources";
import { Block } from "../model/BlockModel";
import { Types } from "mongoose";
import { User } from "../model/UserModel";
import { BLOCKSTATE } from "../Enum";

/**
   * Returns the created BlockResource.
   *
   * @param blockResource BlockResource used to build the Block
   * @returns Promise of the BlockResource that was builded
   * @throws if blockResource is falsly filled it will throw errors
   * - if blockResource.id was already given
   * - if blockResource.next point to a non-existent block
   * - if blockResource.depth is below 0
   * - if blockResource.participant point to a non-existent user
   * - if blockResource.score is below 0
   * - if blockResource.blockState has an unvalid BLOCKSTATE
   *
   */
export async function createBlock(blockResource: BlockResource): Promise<BlockResource> {

    let newBlock: BlockResource = blockResource

    //Fehlerbehandlung
    if (blockResource.id) {
        if (await Block.findById(blockResource.id)) throw new Error("2000 Block already exists")
    }
    if (blockResource.next) {
        if (!await Block.findById(blockResource.next)) throw new Error("2001 Block(next) doesnt exist")
    }
    if (blockResource.participant) {
        if (!await User.findById(blockResource.participant)) throw new Error("2002 Participant doesnt exist")
    }
    const block = await Block.create(newBlock)
    return { id: block.id, next: block.next?.toString(), depth: block.depth, participant: block.participant?.toString(), score: block.score, blockState: block.blockState, name: block.name, blockResult: block.blockResult }
}

/**
   * Updates the BlockResource which is refered through the blockResource.id
   *
   * @param blockResource BlockResource to search the Block
   * @returns Promise of the BlockResource that was updated
   * @throws if blockResource is falsly filled it will throw errors
   * - if blockResource.id is missing
   * - if blockResource.id is not assigned to any block
   * - if mongoose cant update the block
   *
   */
export async function updateBlock(blockResource: BlockResource): Promise<BlockResource> {
    const block = await Block.findById(blockResource.id).exec()
    if (block) {
        if (blockResource.next) {
            if (!await Block.findById(blockResource.next)) throw new Error("2003 Block(next) doesnt exist")
        }
        if (blockResource.participant) {
            if (!await User.findById(blockResource.participant)) throw new Error("2004 Participant doesnt exist")
        }
        let updateResult = await Block.updateOne({ _id: new Types.ObjectId(blockResource.id) }, {
            next: blockResource.next,
            depth: blockResource.depth,
            participant: blockResource.participant,
            score: blockResource.score,
            blockState: blockResource.blockState,
            name: blockResource.name,
            blockResult: blockResource.blockResult
        })
        if (!updateResult.acknowledged) {
            throw new Error("2005 Cant Update Block")
        }

        return await getBlockByID(blockResource.id!)

        //oder ohne getBlockByID

        // const newBlock = await Block.findById(blockResource.id).exec()
        // const res: BlockResource = {
        //     id: newBlock!._id.toString(),
        //     next: newBlock!.next?.toString(),
        //     depth: newBlock!.depth,
        //     participant: newBlock!.participant?.toString(),
        //     score: newBlock!.score,
        //     blockState: newBlock!.blockState
        // }
        // return res
    }
    else {
        throw new Error("2006 no Block found")
    }
}

/**
   * Returns the found BlockResource.
   *
   * @param blockID blockID to search the Block
   * @returns Promise of the BlockResource that was found
   * @throws if blockID is not assigned it will throw an error
   *
   */
export async function getBlockByID(blockID: string): Promise<BlockResource> {
    const block = await Block.findById(blockID).exec()
    if (block) {
        const res: BlockResource = {
            id: block._id.toString(),
            next: block.next?.toString(),
            depth: block.depth,
            participant: block.participant?.toString(),
            score: block.score,
            blockState: block.blockState,
            name: block.name,
            blockResult: block.blockResult
        }
        return res
    }
    throw new Error("2009 no Block found!")
}

/**
   * Deletes the found Block.
   *
   * @param blockID blockID to search the Block
   * @throws if blockID is not assigned it will throw an error
   *
   */
export async function deleteBlockByID(blockID: string): Promise<void> {
    const block = await Block.findById(blockID).exec()
    if (block) {
        if (block.blockState === BLOCKSTATE.scheduled) {
            await Block.deleteOne({ _id: new Types.ObjectId(blockID) }).exec()
        }
    }
    else {
        throw new Error("2010 no Block found!")
    }
}

/**
 * Adds a score to the specified block.
 * @param blockID Block ID to which the score will be added
 * @param score The score to be added
 * @returns Promise of the updated BlockResource
 * @throws if blockID is not assigned or if the block is not found
 */
export async function addScoreToBlock(blockID: string, score: number): Promise<BlockResource> {
    const block = await Block.findById(blockID).exec();

    if (block) {
        if (block.blockState !== BLOCKSTATE.onGoing) {
            throw new Error("2011 Block is not in onGoing state")
        }

        block.score = score;
        await block.save();

        const res: BlockResource = {
            id: block._id.toString(),
            next: block.next?.toString(),
            depth: block.depth,
            participant: block.participant?.toString(),
            score: block.score,
            blockState: block.blockState,
            name: block.name,
            blockResult: block.blockResult
        };

        return res;
    } else {
        throw new Error("2012 no Block found!");
    }
}

/**
 * Compares scores of blocks in a match and advances the participant with the highest score to the next round.
 * Resets scores for the next round.
 * @param blockID The ID of the block to compare scores within the match.
 * @returns Promise of the updated BlockResource.
 * @throws Throws an error if the block is not found or if all blocks in the match are not completed.
 * @deprecated
 */
export async function compareScore(blockID: string): Promise<BlockResource> {
    const block = await Block.findById(blockID).exec();

    if (!block) {
        throw new Error("2013 no Block found!");
    }

    const matchBlocks = await Block.find({ next: block.next }).exec();

    if (matchBlocks.some((block) => block.blockState !== BLOCKSTATE.completed)) {
        throw new Error("2014 all blocks in the match must be completed before comparing scores");
    }

    const maxScoreBlock = matchBlocks.reduce((maxBlock, currentBlock) =>
        currentBlock.score! > maxBlock.score! ? currentBlock : maxBlock
    );

    block.participant = maxScoreBlock.participant;
    block.blockState = BLOCKSTATE.scheduled;
    block.score = 0;
    await block.save();

    const res: BlockResource = {
        id: block._id.toString(),
        next: block.next?.toString(),
        depth: block.depth,
        participant: block.participant?.toString(),
        score: block.score,
        blockState: block.blockState,
        name: block.name,
        blockResult: block.blockResult
    };

    return res;
}
