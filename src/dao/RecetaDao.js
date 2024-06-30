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

export const updateRecetaReaction = async (idReceta, update) => {
    try {
        const updateReaction = await Receta.findByIdAndUpdate(
            idReceta,
            update
        );
        return updateReaction
    } catch (error) {
        console.log(error);
    }

    return updatedUser;
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
                        let: { recetaId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$receta", "$$recetaId"] },
                                    $or: [
                                        { parentComment: null },
                                        { parentComment: { $exists: false } }
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
                },
                {
                    $lookup: {
                        from: "usuarios",
                        localField: "comments.user",
                        foreignField: "_id",
                        as: "commentUsers"
                    }
                },
                {
                    $addFields: {
                        comments: {
                            $map: {
                                input: "$comments",
                                as: "comment",
                                in: {
                                    $mergeObjects: [
                                        "$$comment",
                                        {
                                            user: {
                                                $arrayElemAt: [
                                                    {
                                                        $filter: {
                                                            input: "$commentUsers",
                                                            cond: { $eq: ["$$this._id", "$$comment.user"] }
                                                        }
                                                    },
                                                    0
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: "usuarios",
                        localField: "comments.responses.user",
                        foreignField: "_id",
                        as: "responseUsers"
                    }
                },
                {
                    $addFields: {
                        comments: {
                            $map: {
                                input: "$comments",
                                as: "comment",
                                in: {
                                    $mergeObjects: [
                                        "$$comment",
                                        {
                                            responses: {
                                                $map: {
                                                    input: "$$comment.responses",
                                                    as: "response",
                                                    in: {
                                                        $mergeObjects: [
                                                            "$$response",
                                                            {
                                                                user: {
                                                                    $arrayElemAt: [
                                                                        {
                                                                            $filter: {
                                                                                input: "$responseUsers",
                                                                                cond: { $eq: ["$$this._id", "$$response.user"] }
                                                                            }
                                                                        },
                                                                        0
                                                                    ]
                                                                }
                                                            }
                                                        ]
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        commentUsers: 0,
                        responseUsers: 0,
                        "comments.user.password": 0,
                        "comments.responses.user.password": 0
                    }
                }
            ])
    } catch (error) {
        throw error;
    }
}

export default { saveReceta, getRecetaComentReactions }