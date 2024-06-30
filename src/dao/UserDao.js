import Usuario from '../models/usuarioModel.js';
import { ObjectId } from 'mongodb';

export const getUserbyEmail = async (emailUser) => {
    try {
        return await Usuario.findOne({ email: emailUser.toLowerCase() });
    } catch (error) {
        throw error;
    }
}

export const getUserbyId = async (idUser) => {
    try {
        return await Usuario.findOne({ _id: idUser });
    } catch (error) {
        throw error;
    }
}

export const getUserbyUsename = async (userName) => {
    console.log("mi userName", userName);
    try {
        return await Usuario.findOne({ username: userName.toLowerCase() });
    } catch (error) {
        throw error;
    }
}

export const obtenerFavouriteByIdUser = async (idUser) => {
    console.log("mi idUser desde dao", idUser);
    const userId = new ObjectId(idUser);
    try {
        return await Usuario.aggregate([
            {
                $match: { _id: userId }
            },
            {
                $addFields: {
                    isFavouriteEmpty: {
                        $cond: {
                            if: {
                                $eq: ["$favourite", []]
                            },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "recetas",
                    localField: "favourite",
                    foreignField: "_id",
                    as: "favourite"
                }
            },
            {
                $unwind: {
                    path: "$favourite",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "usuarios",
                    localField: "favourite.user",
                    foreignField: "_id",
                    as: "favourite.user"
                }
            },
            {
                $group: {
                    _id: "$_id",
                    email: {
                        $first: "$email"
                    },
                    username: {
                        $first: "$username"
                    },
                    favourite: {
                        $push: "$favourite"
                    },
                    isFavouriteEmpty: {
                        $first: "$isFavouriteEmpty"
                    }
                }
            },
            {
                $addFields: {
                    favourite: {
                        $cond: {
                            if: "$isFavouriteEmpty",
                            then: [],
                            else: "$favourite"
                        }
                    }
                }
            },
            {
                $project: {
                    isFavouriteEmpty: 0
                }
            }
        ]); // Execute the aggregation query
    } catch (error) {
        throw error;
    }
}

export const saveUser = async (user) => {

    try {
        const usuario = new Usuario(user);
        return await usuario.save();
    } catch (error) {
        throw error;
    }
}

export const obtenerRecetaByIdUser = async (idUser) => {
    console.log("mi idUser desde dao", idUser);
    const userId = new ObjectId(idUser);
    try {
        return await Usuario.aggregate([
            {
                $match: { _id: userId }
            },
            {
                $lookup: {
                    from: "recetas",
                    localField: "_id",
                    foreignField: "user",
                    as: "recetas"
                }
            }
        ]); // Execute the aggregation query
    } catch (error) {
        throw error;
    }
}

export const updateFavourite = async (idUser, update) => {
    try {
        const updatedUser = await Usuario.findByIdAndUpdate(
            idUser,
            update
        );
        return updatedUser
    } catch (error) {
        console.log(error);
    }


    return updatedUser;
}

export const getUsersDescovery = async (idUser) => {
    const userId = new ObjectId(idUser);
    try {
        const usuarios = await Usuario.aggregate([
            {
                $match:
                {
                    _id: {
                        $ne: userId
                    }
                }
            },
            {
                $lookup: {
                    from: "recetas",
                    // Colección a la que se hace referencia
                    localField: "_id",
                    // Campo en la colección Usuario
                    foreignField: "user",
                    // Campo en la colección Recetas
                    as: "recetas" // Nombre del array que contendrá los recetas
                }
            },
            {
                $addFields: {
                    recetasCount: {
                        $size: "$recetas"
                    } // Agregar un campo con la cantidad de recetas
                }
            },
            {
                $project: {
                    email: 1,
                    recetasCount: 1,
                    username: 1
                    // Otros campos que desees incluir
                }
            }
        ])

        console.log("mis usuarios", usuarios);
        return usuarios
    } catch (error) {
        throw error
    }
}

export default { saveUser, obtenerRecetaByIdUser, getUserbyEmail, getUserbyUsename, updateFavourite, obtenerFavouriteByIdUser, getUserbyId }