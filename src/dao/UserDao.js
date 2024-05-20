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

export const obtenerPostByIdUser = async (idUser) => {
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

export default { saveUser, obtenerPostByIdUser, getUserbyEmail }