import Dificultad from "../models/dificultadModel.js";

export const saveDificultad = async (dificultad) => {

    try {
        const dificulty = new Dificultad(dificultad);
        return await dificulty.save();
    } catch (error) {
        throw error;
    }
}

export const getDificultad = async () => {

    try {
        const dificulty = await Dificultad.find();
        return dificulty
    } catch (error) {
        throw error;
    }
}

export default { saveDificultad }