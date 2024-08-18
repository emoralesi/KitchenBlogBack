import GrupoIngrediente from "../models/grupoIngredienteModel.js";

export const saveGrupoIngrediente = async (grupo, session) => {
    try {
        const grupoIngrediente = new GrupoIngrediente(grupo);
        if (session) {
            return await grupoIngrediente.save({ session });
        } else {
            return await grupoIngrediente.save();
        }
    } catch (error) {
        throw error;
    }
}

export const updateGrupoIngrediente = async (grupo, session) => {
    try {
        const options = { new: true };
        if (session) {
            options.session = session;
        }
        const resultado = await GrupoIngrediente.findByIdAndUpdate(grupo._id, grupo, options);
        return resultado;
    } catch (error) {
        console.error('Error al hacer updateGrupoIngrediente:', error);
        throw error;
    }
}

export const obtenerGrupoIngrediente = async (id) => {
    try {
        const resultado = GrupoIngrediente.findById(id).lean();
        return resultado;
    } catch (error) {
        console.error('Error al hacer obtenerGrupoIngrediente:', error);
        throw error;
    }
}

export default { saveGrupoIngrediente };