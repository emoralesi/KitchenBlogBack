import GrupoIngrediente from "../models/grupoIngredienteModel.js";

export const saveGrupoIngrediente = async (grupo) => {

    try {
        const grupoIngrediente = new GrupoIngrediente(grupo);
        return await grupoIngrediente.save();
    } catch (error) {
        throw error;
    }
}

export default { saveGrupoIngrediente }