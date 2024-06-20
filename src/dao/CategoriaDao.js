import Categoria from "../models/categoriaModel.js";

export const saveCategoria = async (categoria) => {

    try {
        const category = new Categoria(categoria);
        return await category.save();
    } catch (error) {
        throw error;
    }
}

export const getCategoria = async () => {

    try {
        const category = await Categoria.find();
        return category;
    } catch (error) {
        throw error;
    }
}

export default { saveCategoria }