import Ingrediente from "../models/ingredienteModel.js";

export const saveIngrediente = async (ingrediente) => {

    try {
        const ingredient = new Ingrediente(ingrediente);
        return await ingredient.save();
    } catch (error) {
        throw error;
    }
}

export const getIngrediente = async () => {

    try {
        const Ingredientes = await Ingrediente.find();
        return Ingredientes;
    } catch (error) {
        throw error;
    }
}

export default { saveIngrediente }