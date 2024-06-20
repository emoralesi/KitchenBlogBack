import Usuario from '../models/usuarioModel.js';
import { ObjectId } from 'mongodb';

export const getUserbyEmail = async (emailUser) => {
    try {
        return await Usuario.findOne({ email: emailUser });
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
    const userId = new ObjectId(idUser);
    try {
        return await Usuario.aggregate([
            {
                $match: { _id: userId }
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "_id",
                    foreignField: "user",
                    as: "posteos"
                }
            }
        ]); // Execute the aggregation query
    } catch (error) {
        throw error;
    }
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
                    from: "posts",
                    // Colección a la que se hace referencia
                    localField: "_id",
                    // Campo en la colección Usuario
                    foreignField: "user",
                    // Campo en la colección Post
                    as: "posts" // Nombre del array que contendrá los posts
                }
            },
            {
                $addFields: {
                    postCount: {
                        $size: "$posts"
                    } // Agregar un campo con la cantidad de posts
                }
            },
            {
                $project: {
                    email: 1,
                    postCount: 1
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

export default { saveUser, obtenerRecetaByIdUser, getUserbyEmail }