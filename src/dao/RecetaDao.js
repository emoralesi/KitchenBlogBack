import { ObjectId } from 'mongodb';
import Receta from '../models/recetaModel.js';

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
            update,
            { new: true }
        );
        return updateReaction
    } catch (error) {
        console.log(error);
    }

    return updatedUser;
}

export const getRecetaById = async (idReceta) => {
    try {
        const receta = await Receta.findById(idReceta);
        return receta
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
                        localField: "_id",
                        foreignField: "receta",
                        as: "comments"
                    }
                },
                {
                    $lookup: {
                        from: "reactions",
                        localField: "reactions",
                        foreignField: "_id",
                        as: "reactions"
                    }
                },
                {
                    $unwind: {
                        path: "$comments",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "usuarios",
                        localField: "comments.user",
                        foreignField: "_id",
                        as: "comments.user"
                    }
                },
                {
                    $match: {
                        "comments.parentComment": null
                    }
                },
                {
                    $lookup: {
                        from: "comments",
                        localField: "comments._id",
                        foreignField: "parentComment",
                        as: "comments.responses"
                    }
                },
                {
                    $lookup: {
                        from: "reactions",
                        localField: "comments.reactions",
                        foreignField: "_id",
                        as: "comments.reactions"
                    }
                },
                {
                    $unwind: {
                        path: "$comments.responses",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "usuarios",
                        localField: "comments.responses.user",
                        foreignField: "_id",
                        as: "comments.responses.user"
                    }
                },
                {
                    $lookup: {
                        from: "reactions",
                        localField: "comments.responses.reactions",
                        foreignField: "_id",
                        as: "comments.responses.reactions"
                    }
                },
                {
                    $unwind: {
                        path: "$comments.user",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: {
                        path: "$comments.responses.user",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: {
                            id: "$_id",
                            commentId: "$comments._id"
                        },
                        titulo: {
                            $first: "$titulo"
                        },
                        descripcion: {
                            $first: "$descripcion"
                        },
                        images: {
                            $first: "$images"
                        },
                        hours: {
                            $first: "$hours"
                        },
                        minutes: {
                            $first: "$minutes"
                        },
                        cantidadPersonas: {
                            $first: "$cantidadPersonas"
                        },
                        dificultad: {
                            $first: "$dificultad"
                        },
                        categoria: {
                            $first: "$categoria"
                        },
                        grupoIngrediente: {
                            $first: "$grupoIngrediente"
                        },
                        utencilio: {
                            $first: "$utencilio"
                        },
                        subCategoria: {
                            $first: "$subCategoria"
                        },
                        user: {
                            $first: "$user"
                        },
                        reactions: {
                            $first: "$reactions"
                        },
                        pasos: {
                            $first: "$pasos"
                        },
                        fechaReceta: {
                            $first: "$fechaReceta"
                        },
                        comment: {
                            $first: "$comments"
                        },
                        responses: {
                            $push: "$comments.responses"
                        }
                    }
                },
                {
                    $group: {
                        _id: "$_id.id",
                        titulo: {
                            $first: "$titulo"
                        },
                        descripcion: {
                            $first: "$descripcion"
                        },
                        images: {
                            $first: "$images"
                        },
                        hours: {
                            $first: "$hours"
                        },
                        minutes: {
                            $first: "$minutes"
                        },
                        cantidadPersonas: {
                            $first: "$cantidadPersonas"
                        },
                        dificultad: {
                            $first: "$dificultad"
                        },
                        categoria: {
                            $first: "$categoria"
                        },
                        grupoIngrediente: {
                            $first: "$grupoIngrediente"
                        },
                        utencilio: {
                            $first: "$utencilio"
                        },
                        subCategoria: {
                            $first: "$subCategoria"
                        },
                        user: {
                            $first: "$user"
                        },
                        reactions: {
                            $first: "$reactions"
                        },
                        pasos: {
                            $first: "$pasos"
                        },
                        fechaReceta: {
                            $first: "$fechaReceta"
                        },
                        comments: {
                            $push: {
                                _id: "$comment._id",
                                content: "$comment.content",
                                receta: "$comment.receta",
                                user: "$comment.user",
                                reactions: "$comment.reactions",
                                parentComment: "$comment.parentComment",
                                responses: "$responses"
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

export const obtenerShopping = async (idRecetas) => {

    idRecetas.forEach((element, index, arr) => {
        arr[index] = new ObjectId(element);
    });

    console.log("mi idReceta", idRecetas);

    try {
        const shopping = Receta.aggregate([
            {
                $match: {
                    _id: {
                        $in: idRecetas
                    }
                }
            },
            {
                $lookup: {
                    from: "grupoingredientes",
                    localField: "grupoIngrediente",
                    foreignField: "_id",
                    as: "grupoIngrediente"
                }
            },
            {
                $unwind: "$grupoIngrediente"
            },
            {
                $lookup: {
                    from: "items",
                    localField: "grupoIngrediente.item",
                    foreignField: "_id",
                    as: "grupoIngrediente.items"
                }
            },
            {
                $unwind: "$grupoIngrediente.items"
            },
            {
                $lookup: {
                    from: "medidas",
                    localField: "grupoIngrediente.items.medida",
                    foreignField: "_id",
                    as: "grupoIngrediente.items.medida"
                }
            },
            {
                $unwind: "$grupoIngrediente.items.medida"
            },
            {
                $lookup: {
                    from: "ingredientes",
                    localField:
                        "grupoIngrediente.items.ingrediente",
                    foreignField: "_id",
                    as: "grupoIngrediente.items.ingrediente"
                }
            },
            {
                $unwind: "$grupoIngrediente.items.ingrediente"
            },
            {
                $group: {
                    _id: "$_id",
                    titulo: {
                        $first: "$titulo"
                    },
                    // Agregar el campo titulo
                    grupoIngrediente: {
                        $first: "$grupoIngrediente"
                    },
                    items: {
                        $push: "$grupoIngrediente.items"
                    }
                }
            },
            {
                $project: {
                    titulo: 1,
                    // Incluir el campo titulo en la proyección
                    "grupoIngrediente.items": "$items"
                }
            }
        ])

        return shopping;
    } catch (error) {
        console.log(error);
        throw error;

    }
}

export default { saveReceta, getRecetaComentReactions }