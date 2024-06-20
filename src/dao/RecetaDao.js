import { ObjectId } from 'mongodb';
import Receta from '../models/RecetaModel.js';

export const saveReceta = async (receta) => {
    try {
        const Recetas = new Receta(receta);
        return await Recetas.save();
    } catch (error) {
        throw error;
    }
}

export const getUserByRecetaId = async (id) => {
    try {

    } catch (error) {
        throw error
    }
}

export const getRecetaComentReactions = async (idReceta) => {
    const RecetaId = new ObjectId(idReceta);
    try {
        return await Receta.aggregate(
            [
                {
                    $match: { _id: RecetaId }
                },
                {
                    $lookup: {
                        from: "comments",
                        let: { RecetaId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$Receta", "$$RecetaId"] },
                                    $or: [
                                        { "parentComment": null },
                                        { "parentComment": { $exists: false } }
                                    ]
                                }
                            },
                            {
                                $lookup: {
                                    from: "comments",
                                    localField: "_id",
                                    foreignField: "parentComment",
                                    as: "responses"
                                }
                            }
                        ],
                        as: "comments"
                    }
                },
                {
                    $addFields: {
                        comments: {
                            $cond: {
                                if: { $eq: [{ $size: "$comments" }, 0] },
                                then: [],
                                else: "$comments"
                            }
                        }
                    }
                }
            ])
    } catch (error) {
        throw error;
    }
}

export default { saveReceta, getRecetaComentReactions }