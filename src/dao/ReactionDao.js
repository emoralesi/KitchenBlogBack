import Reaction from "../models/reactionModel.js";

export const saveReaction = async (reaccion) => {
    try {
        const reaction = new Reaction(reaccion);
        return await reaction.save();
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const getReactionByReceta = async (idUser, idReceta) => {
    try {
        const reaction = await Reaction.find({ user_id: idUser, referencia_id: idReceta });
        return reaction;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const getReactionByComment = async (idUser, idReceta) => {
    try {
        const reaction = await Reaction.find({ user_id: idUser, referencia_id: idReceta });
        return reaction;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const deleteReaction = async (idReaction) => {
    try {
        const reaction = await Reaction.findByIdAndDelete(idReaction);
        return reaction
    } catch (error) {
        console.log(error);
        throw error
    }
}