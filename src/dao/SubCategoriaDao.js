import SubCategoria from "../models/subCategoriaModel.js";

export const saveSubCategoria = async (subCAtegoria) => {

    try {
        const subCategory = new SubCategoria(subCAtegoria);
        return await subCategory.save();
    } catch (error) {
        throw error;
    }
}

export const getSubCategoria = async () => {

    try {
        const subCategory = await SubCategoria.find();
        return subCategory;
    } catch (error) {
        throw error;
    }
}

export default { saveSubCategoria }